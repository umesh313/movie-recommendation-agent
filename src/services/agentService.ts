import type {
  AgentResponse,
  ChatMessage,
  ExtractedPreferences,
  MovieSummary,
  QueryType,
  PersonResponse,
  ConversationContext,
  DiscoveryMode,
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
import {
  getConversationSummary,
} from "./memoryService";
import { moodCategories, getMoodsByKeywords } from "@/lib/moodCategories";
import { featuredMovies, getFeaturedMoviesByGenre, getFeaturedMoviesByRating } from "@/data/featuredMovies";

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

// Enhanced recommendation with memory context
export async function recommendMoviesWithMemory(
  userMessage: string,
  preferences: ExtractedPreferences,
  candidates: ReturnType<typeof import("./tmdb").compactMovieForAgent>,
  conversationContext?: ConversationContext,
  discoveryMode?: DiscoveryMode
): Promise<AgentResponse> {
  const genres = await getGenres();
  const genreList = genres.map((g) => g.name).join(", ");
  const moodList = moodCategories.map((m) => `${m.name} (${m.keywords.join(", ")})`).join("; ");
  
  // Build conversation context string
  let contextString = "";
  if (conversationContext) {
    contextString = getConversationSummary(conversationContext);
  }

  // Detect moods from user message
  const detectedMoods = getMoodsByKeywords([userMessage, preferences.mood || ""].filter(Boolean));
  const moodString = detectedMoods.length > 0 
    ? detectedMoods.map(m => m.name).join(", ") 
    : preferences.mood || "not specified";

  // Build discovery mode context
  let discoveryContext = "";
  if (discoveryMode) {
    switch (discoveryMode) {
      case "hidden_gems":
        discoveryContext = "Focus on lesser-known films with lower popularity but high quality. Avoid blockbusters and mainstream hits.";
        break;
      case "underrated":
        discoveryContext = "Prioritize films with high ratings but lower vote counts. These are quality films that deserve more attention.";
        break;
      case "cult_classics":
        discoveryContext = "Focus on films with dedicated fan communities, unique styles, and unconventional storytelling.";
        break;
      case "popular":
      default:
        discoveryContext = "Focus on well-known, highly-rated films that have broad appeal.";
    }
  }

  // Filter out previously seen movies if we have context
  let filteredCandidates = candidates;
  if (conversationContext && conversationContext.previousRecommendations.length > 0) {
    filteredCandidates = candidates.filter(c => 
      !conversationContext.previousRecommendations.includes(c.tmdb_id)
    );
    // If we filtered too many, keep some variety
    if (filteredCandidates.length < 3) {
      filteredCandidates = candidates;
    }
  }

  const systemPrompt = `You are CineMatch, a passionate film curator and AI movie expert with deep knowledge of cinema. Your recommendations are thoughtful, personalized, and engaging.

**User Request:** "${userMessage}"

**Detected Preferences:**
- Genres: ${preferences.genreNames.join(", ") || "any"} (available: ${genreList})
- Mood: ${moodString} (available moods: ${moodList})
- Era: ${preferences.yearFrom ? `${preferences.yearFrom}-${preferences.yearTo || "present"}` : "any"}
${preferences.searchQuery ? `- Looking for films similar to: "${preferences.searchQuery}"` : ""}

${contextString ? `**Our Conversation So Far:**\n${contextString}` : ""}

${discoveryContext ? `**Discovery Mode:** ${discoveryContext}` : ""}

**Available Movies to Recommend (choose ONLY from these):**
${JSON.stringify(filteredCandidates, null, 2)}

**YOUR MISSION:**
Curate 5-7 perfect film recommendations that feel personally tailored to this user. Think like a knowledgeable friend who truly understands their taste.

**GUIDELINES FOR OUTSTANDING RECOMMENDATIONS:**

1. **Personalization is Key**: Each "why_watch" should feel like it was written specifically for this user. Reference their stated preferences, mood, or conversation history.

2. **Variety Matters**: Mix different eras, styles, and tones while staying true to their preferences. Don't recommend 5 superhero movies in a row unless explicitly asked.

3. **Be Specific, Not Generic**: Instead of "great acting and story," say "stellar performances and a narrative that keeps you guessing until the final frame."

4. **Connect the Dots**: If they mentioned loving a particular film, explain how your recommendation shares similar DNA (themes, director, tone, etc.).

5. **Highlight What Makes Each Special**: Every film should have a unique selling point - whether it's groundbreaking cinematography, an unforgettable score, or a story that challenges conventions.

6. **Consider the Mood**: If they want something uplifting, don't recommend a depressing drama. Match the emotional tone they're seeking.

7. **Balance Familiar and Surprising**: Include some well-known titles they might expect, but also throw in a curveball - a film they might not have considered but will love.

**Return ONLY valid JSON in this exact structure:**
{
  "intro": "A warm, engaging opening that shows you understand what they're looking for. Make it conversational and enthusiastic.",
  "recommendations": [
    {
      "tmdb_id": 123,
      "title": "Exact title from the candidate list",
      "why_watch": "2-3 compelling sentences that make them excited to watch this film. Be specific about what makes it perfect for them.",
      "highlight": "Best for: [specific mood, occasion, or type of viewer]"
    }
  ]
}

**Example of a great why_watch:**
"Perfect if you loved the mind-bending narrative of Inception. This film plays with time and memory in equally fascinating ways, but with a more intimate, emotional core that will stay with you long after the credits roll."

**Remember:** You're not just listing movies - you're creating an experience. Make them feel understood and excited about cinema again.`;

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Please recommend movies based on my preferences and our conversation.` },
    ],
    0.7,
    1500
  );

  const response = parseJson<AgentResponse>(raw);

  if (!response.recommendations?.length) {
    throw new Error("Agent returned no recommendations.");
  }

  const validIds = new Set(filteredCandidates.map((c) => c.tmdb_id));
  response.recommendations = response.recommendations.filter((r) =>
    validIds.has(r.tmdb_id)
  );

  if (response.recommendations.length === 0) {
    throw new Error("Agent picks did not match available movies.");
  }

  return response;
}

// Generate AI-powered taste profile summary
// Get featured movie recommendations based on genre or rating
export async function getFeaturedRecommendations(
  userMessage: string,
  preferences: ExtractedPreferences
): Promise<AgentResponse> {
  let featured: typeof featuredMovies = [];
  let intro = "";

  // Check if user is asking about specific rating range
  const ratingMatch = userMessage.match(/rating\s+(?:of\s+)?(\d+\.?\d*)\s*(?:to\s+)?(\d+\.?\d*)?/i) ||
                     userMessage.match(/(\d+\.?\d*)\s*(?:to\s+)?(\d+\.?\d*)?\s+rating/i);
  
  if (ratingMatch) {
    const minRating = parseFloat(ratingMatch[1]) || 7.8;
    const maxRating = parseFloat(ratingMatch[2]) || minRating + 0.1;
    featured = getFeaturedMoviesByRating(minRating, maxRating);
    intro = `Here are our featured movies with ratings between ${minRating} and ${maxRating}:`;
  } 
  // Check for genre-based queries
  else if (preferences.genreNames.length > 0) {
    featured = getFeaturedMoviesByGenre(preferences.genreNames);
    if (featured.length > 0) {
      intro = `Based on your interest in ${preferences.genreNames.join(', ')}, here are our featured recommendations:`;
    }
  }
  
  // Fallback to random featured movies if no specific match
  if (featured.length === 0) {
    const shuffled = [...featuredMovies].sort(() => 0.5 - Math.random());
    featured = shuffled.slice(0, 10);
    intro = "Here are some of our featured highly-rated movies:";
  }

  // Search TMDB to get TMDB IDs for these movies
  const enrichedMovies = await Promise.all(
    featured.slice(0, 7).map(async (movie) => {
      try {
        const searchResults = await searchMovies(movie.title);
        if (searchResults.length > 0) {
          const tmdbMovie = searchResults[0];
          return {
            tmdb_id: tmdbMovie.id,
            title: movie.title,
            why_watch: `IMDb Rating: ${movie.imdbRating}/10 (${movie.votes} votes). ${movie.year} release.`,
            highlight: `Featured Pick #${movie.rank}`
          };
        }
      } catch (e) {
        // If search fails, create a basic entry
      }
      return {
        tmdb_id: 0, // Will be filtered out
        title: movie.title,
        why_watch: `IMDb Rating: ${movie.imdbRating}/10. ${movie.year} release.`,
        highlight: `Featured Pick #${movie.rank}`
      };
    })
  );

  const validRecommendations = enrichedMovies.filter(m => m.tmdb_id > 0);

  if (validRecommendations.length === 0) {
    throw new Error("No featured movies could be matched to TMDB.");
  }

  return {
    intro,
    recommendations: validRecommendations
  };
}

export async function generateTasteProfileSummary(profile: {
  favoriteMovies: Array<{ title: string; tmdbId?: number }>;
  preferredGenres: string[];
  favoriteActors: string[];
  favoriteDirectors: string[];
  dislikedGenres: string[];
}): Promise<string> {
  const systemPrompt = `You are a film expert analyzing a user's movie taste to create a personalized taste profile summary.

**User's Movie Preferences:**
${profile.favoriteMovies.length > 0 ? `- Favorite Movies: ${profile.favoriteMovies.map(m => m.title).join(", ")}` : ""}
${profile.preferredGenres.length > 0 ? `- Preferred Genres: ${profile.preferredGenres.join(", ")}` : ""}
${profile.favoriteActors.length > 0 ? `- Favorite Actors: ${profile.favoriteActors.join(", ")}` : ""}
${profile.favoriteDirectors.length > 0 ? `- Favorite Directors: ${profile.favoriteDirectors.join(", ")}` : ""}
${profile.dislikedGenres.length > 0 ? `- Disliked Genres: ${profile.dislikedGenres.join(", ")}` : ""}

Create a concise, insightful 2-3 sentence summary that captures the essence of their taste. Focus on:
1. What types of stories they enjoy
2. Common themes or styles
3. What makes their taste unique
4. What they tend to avoid

Return ONLY the summary text, no JSON.`;

  try {
    const raw = await callGroq(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Please analyze my movie taste and create a profile summary." },
      ],
      0.7,
      300
    );
    return raw;
  } catch (e) {
    // Fallback to basic summary
    const genres = profile.preferredGenres.join(", ") || "varied";
    const favorites = profile.favoriteMovies.slice(0, 3).map(m => m.title).join(", ");
    return `You enjoy ${genres} films${favorites ? `, including ${favorites}` : ""}. Your taste reflects a preference for quality storytelling and compelling characters.`;
  }
}

