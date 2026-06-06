import type {
  AgentResponse,
  ChatMessage,
  ExtractedPreferences,
  MovieSummary,
  QueryType,
  PersonResponse,
} from "@/types/movie";
import {
  getGenres,
  keywordMatchGenres,
  matchGenreNames,
  searchMovies,
  searchPeople,
  getPersonDetails,
  getPersonCredits,
} from "./tmdb";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

function getApiKey(): string {
  const key = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  if (!key) {
    throw new Error(
      "Missing VITE_GROQ_API_KEY. Add it to your .env file."
    );
  }
  return key;
}

async function callGroq(messages: ChatMessage[], temperature = 0.6, maxTokens = 800): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

function parseJson<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
    throw new Error("Failed to parse AI response as JSON.");
  }
}

export async function extractPreferences(userMessage: string): Promise<ExtractedPreferences> {
  const genres = await getGenres();
  const genreList = genres.map((g) => g.name).join(", ");

  const systemPrompt = `You extract movie preferences from user messages. Available TMDB genres: ${genreList}.

Return ONLY valid JSON with this shape:
{
  "genreNames": ["Action", "Sci-Fi"],
  "yearFrom": 2010,
  "yearTo": 2019,
  "searchQuery": "Inception",
  "mood": "dark and mind-bending"
}

Rules:
- genreNames must use exact genre names from the list when possible
- yearFrom/yearTo are optional integers (use decade hints: "90s" = 1990-1999, "2010s" = 2010-2019)
- searchQuery only if user mentions a specific movie ("like Inception", "similar to The Matrix")
- mood is a short phrase describing tone/feeling
- If no genre detected, infer from mood/context`;

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    0.3,
    300
  );

  let parsed: {
    genreNames?: string[];
    yearFrom?: number;
    yearTo?: number;
    searchQuery?: string;
    mood?: string;
  };

  try {
    parsed = parseJson<typeof parsed>(raw);
  } catch {
    const fallbackIds = keywordMatchGenres(userMessage, genres);
    return {
      genreIds: fallbackIds,
      genreNames: genres.filter((g) => fallbackIds.includes(g.id)).map((g) => g.name),
      mood: userMessage,
    };
  }

  let genreIds = await matchGenreNames(parsed.genreNames ?? []);
  if (genreIds.length === 0) {
    genreIds = keywordMatchGenres(userMessage, genres);
  }

  return {
    genreIds,
    genreNames: parsed.genreNames ?? [],
    yearFrom: parsed.yearFrom,
    yearTo: parsed.yearTo,
    searchQuery: parsed.searchQuery,
    mood: parsed.mood,
  };
}

export async function recommendMovies(
  userMessage: string,
  preferences: ExtractedPreferences,
  candidates: ReturnType<typeof import("./tmdb").compactMovieForAgent>,
  chatHistory?: string[]
): Promise<AgentResponse> {
  const recentContext = chatHistory?.slice(0, 3).join(" | ") ?? "";
  const historyContext = recentContext ? `\nRecent chat: ${recentContext}` : "";
  
  const systemPrompt = `You are CineMatch, an expert film curator specializing in movies, TV shows, and films worldwide. Enthusiastic, concise, never spoil plots. Provide thoughtful, personalized recommendations based on the user's request and context.

User request: "${userMessage}"${historyContext}
Detected mood: ${preferences.mood ?? "not specified"}
Genres: ${preferences.genreNames.join(", ") || "any"}

Available movies (pick ONLY from this list — use exact tmdb_id values):
${JSON.stringify(candidates, null, 2)}

Return ONLY valid JSON:
{
  "intro": "One warm sentence greeting the user about their picks",
  "recommendations": [
    {
      "tmdb_id": 123,
      "title": "Exact title from list",
      "why_watch": "1-2 sentences — personal, specific, no spoilers",
      "highlight": "Best for: short phrase"
    }
  ]
}

Rules:
- Recommend exactly 5-7 films from the candidate list (show diversity)
- Each why_watch must feel unique and tailored to the user's request
- Match stated genre, mood, and era preferences
- Prefer higher-rated films when equally good fits
- Consider chat history for personalization: if user likes specific genres/eras, favor similar picks
- For international cinema (Bollywood, Korean, etc.), highlight what makes them special
- Provide reasoning that connects to user's stated preferences`;

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Curate my movie picks based on my request: "${userMessage}"` },
    ],
    0.7,
    1200
  );

  const response = parseJson<AgentResponse>(raw);

  if (!response.recommendations?.length) {
    throw new Error("Agent returned no recommendations.");
  }

  const validIds = new Set(candidates.map((c) => c.tmdb_id));
  response.recommendations = response.recommendations.filter((r) =>
    validIds.has(r.tmdb_id)
  );

  if (response.recommendations.length === 0) {
    throw new Error("Agent picks did not match available movies.");
  }

  return response;
}


export function isQuoteOrMovieFactRequest(message: string): boolean {
  const lower = message.toLowerCase();
  return [
    "quote",
    "line",
    "dialogue",
    "what did",
    "famous line",
    "say",
    "say in",
    "said",
    "dialogue from",
    "memorable line",
    "movie quote",
  ].some((term) => lower.includes(term));
}

export async function answerMovieQuestion(
  userMessage: string
): Promise<AgentResponse> {
  const match = userMessage.match(/from\s+"([^"]+)"|from\s+([^\?]+)/i);
  const searchQuery = match?.[1] || match?.[2] || undefined;
  let movie = null;

  if (searchQuery) {
    const results = await searchMovies(searchQuery.trim());
    movie = results[0] ?? null;
  }

  const movieInfo = movie
    ? `Movie title: "${movie.title}"\nOverview: ${movie.overview}`
    : "No exact movie was identified from the query.";

  const systemPrompt = `You are CineMatch, a movie expert that answers quote and movie trivia questions honestly. Use the user request and movie information to answer clearly. If the user asks for a quote, provide the quote only when you can be confident in it. If you cannot verify an exact quote, say you could not confirm the exact line and share a memorable fact or context about the film instead.`;

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: `User request: "${userMessage}"\n${movieInfo}` },
    ],
    0.35,
    450
  );

  return {
    intro: raw,
    recommendations: [],
  };
}

export async function getFallbackRecommendations(
  movies: MovieSummary[]
): Promise<AgentResponse> {
  const top = movies.slice(0, 4);
  return {
    intro: "Here are some highly-rated picks I found for you:",
    recommendations: top.map((m) => ({
      tmdb_id: m.id,
      title: m.title,
      why_watch: m.overview.slice(0, 120) + "…",
      highlight: `Rated ${m.vote_average.toFixed(1)}/10`,
    })),
  };
}

export function checkApiKeys(): { tmdb: boolean; groq: boolean } {
  return {
    tmdb: Boolean(import.meta.env.VITE_TMDB_API_KEY),
    groq: Boolean(import.meta.env.VITE_GROQ_API_KEY),
  };
}

export async function detectQueryType(userMessage: string): Promise<QueryType> {
  const lower = userMessage.toLowerCase();

  // Check for actor/actress queries
  if (
    /\b(who is|tell me about|biography|actor|actress|filmography)\b/.test(
      lower
    )
  ) {
    const people = await searchPeople(userMessage);
    if (people.length > 0) return "actor";
  }

  // Check for non-movie queries
  if (
    /\b(weather|sports|news|recipe|math|code|programming|history|geography)\b/.test(
      lower
    ) &&
    !/\bmovie\b|\bfilm\b|\btv\b|\bshow\b|\bactor\b|\bactress\b/.test(lower)
  ) {
    return "non_movie";
  }

  // Check for TV show queries
  if (/\b(tv show|series|episode|season)\b/.test(lower)) {
    return "tvshow";
  }

  // Check for quote queries
  if (
    /\b(quote|line|dialogue|what did|famous line|say|said|memorable)\b/.test(
      lower
    )
  ) {
    return "quote";
  }

  // Default to recommendation
  return "recommendation";
}

export async function answerActorQuery(actorName: string): Promise<PersonResponse> {
  const people = await searchPeople(actorName);
  if (people.length === 0) {
    throw new Error(`Actor "${actorName}" not found.`);
  }

  const person = people[0];
  const details = await getPersonDetails(person.id);
  const credits = await getPersonCredits(person.id);

  const intro = `${details.name}${details.birthday ? " (Born " + formatDate(details.birthday) + ")" : ""} is a talented ${details.biography.length > 0 ? "actor/actress" : "performer"}. ${details.biography.slice(0, 200)}...\n\n**Filmography:**\nMovies: ${credits.movies.length} | TV Shows: ${credits.tvShows.length}`;

  return {
    intro,
    person: details,
    credits,
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function rejectNonMovieQuery(): Promise<AgentResponse> {
  return {
    intro: "I'm specialized in movies, TV shows, and films! I can help you find recommendations, tell you about actors and actresses, share movie quotes, and discuss everything cinema. What movie-related question can I help you with?",
    recommendations: [],
  };
}

export async function extractLanguagePreference(userMessage: string): Promise<string | undefined> {
  const lower = userMessage.toLowerCase();
  const languages: Record<string, string> = {
    spanish: "es",
    korean: "ko",
    french: "fr",
    german: "de",
    hindi: "hi",
    bollywood: "hi",
  };

  for (const [keyword, code] of Object.entries(languages)) {
    if (lower.includes(keyword)) {
      return code;
    }
  }

  return undefined;
}

