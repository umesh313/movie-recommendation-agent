import { useCallback, useEffect, useState } from "react";
import {
  answerMovieQuestion,
  answerActorQuery,
  checkApiKeys,
  detectQueryType,
  extractLanguagePreference,
  extractPreferences,
  getFallbackRecommendations,
  getFeaturedRecommendations,
  recommendMovies,
  rejectNonMovieQuery,
} from "@/services/agentService";
import {
  compactMovieForAgent,
  discoverByGenre,
  discoverByLanguage,
  getMovieDetails,
  getSimilarMovies,
  getTrailerKey,
  posterUrl,
  searchMovies,
} from "@/services/tmdb";
import type {
  AgentStatus,
  ChatMessage,
  EnrichedRecommendation,
  ExtractedPreferences,
  PersonResponse,
  QueryType,
} from "@/types/movie";

const WELCOME =
  "Hi! I'm CineMatch — your movie expert! Ask me for recommendations, search for actors/actresses, discover films from Spanish, Korean, French, German cinema, or Bollywood. What would you like to explore?"

export function useMovieAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [statusLabel, setStatusLabel] = useState("");
  const [recommendations, setRecommendations] = useState<EnrichedRecommendation[]>([]);
  const [allRecommendations, setAllRecommendations] = useState<EnrichedRecommendation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actorData, setActorData] = useState<PersonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiKeys = checkApiKeys();
  const ITEMS_PER_PAGE = 6;

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    if (!apiKeys.tmdb || !apiKeys.groq) {
      setError(
        "Missing API keys. Copy .env.example to .env and add your TMDB and Groq keys."
      );
      return;
    }

    setError(null);
    setLoading(true);
    setRecommendations([]);
    setActorData(null);
    setCurrentPage(1);
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    
    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 10);
      window.localStorage.setItem("cineMatch_history", JSON.stringify(next));
      return next;
    });

    try {
      // Detect query type
      const queryType: QueryType = await detectQueryType(trimmed);
      
      if (queryType === "non_movie") {
        const response = await rejectNonMovieQuery();
        setMessages((m) => [
          ...m,
          { role: "assistant", content: response.intro },
        ]);
        setStatus("done");
        setStatusLabel("");
        return;
      }

      if (queryType === "actor") {
        setStatus("extracting");
        setStatusLabel("Finding actor info...");
        const personResponse = await answerActorQuery(trimmed);
        setActorData(personResponse);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: personResponse.intro },
        ]);
        setStatus("done");
        setStatusLabel("");
        return;
      }

      if (queryType === "quote") {
        setStatus("extracting");
        setStatusLabel("Searching movie knowledge...");
        const answer = await answerMovieQuestion(trimmed);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: answer.intro },
        ]);
        setStatus("done");
        setStatusLabel("");
        return;
      }

      // Handle recommendations (including language-specific and TV shows)
      setStatus("extracting");
      setStatusLabel("Understanding your taste...");
      const preferences: ExtractedPreferences = await extractPreferences(trimmed);
      const language = await extractLanguagePreference(trimmed);

      // Check if this is a genre or rating query that should use featured movies
      const useFeatured = shouldUseFeaturedMovies(trimmed, preferences);

      setStatus("searching");
      setStatusLabel("Searching movies...");
      
      let agentResponse;
      
      if (useFeatured) {
        // Use featured movies for genre/rating queries
        try {
          agentResponse = await getFeaturedRecommendations(trimmed, preferences);
        } catch (featuredError) {
          // Fallback to regular recommendations if featured fails
          const candidates = await fetchCandidates(preferences, language);
          const compact = compactMovieForAgent(candidates);
          try {
            agentResponse = await recommendMovies(trimmed, preferences, compact);
          } catch {
            agentResponse = await getFallbackRecommendations(candidates);
          }
        }
      } else {
        // Regular recommendation flow
        let candidates = await fetchCandidates(preferences, language);

        if (candidates.length === 0) {
          candidates = await discoverByGenre([], undefined, undefined);
        }

        const compact = compactMovieForAgent(candidates);

        setStatus("recommending");
        setStatusLabel("Curating your picks...");
        try {
          agentResponse = await recommendMovies(trimmed, preferences, compact);
        } catch {
          agentResponse = await getFallbackRecommendations(candidates);
        }
      }

      setStatus("enriching");
      setStatusLabel("Loading posters & trailers...");
      const enriched = await enrichRecommendations(agentResponse.recommendations ?? []);
      
      setAllRecommendations(enriched);
      const pageCount = Math.ceil(enriched.length / ITEMS_PER_PAGE);
      setTotalPages(pageCount);
      setRecommendations(enriched.slice(0, ITEMS_PER_PAGE));

      setMessages((m) => [
        ...m,
        { role: "assistant", content: agentResponse.intro },
      ]);
      
      setStatus("done");
      setStatusLabel("");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setError(msg);
      setStatus("error");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Sorry, I hit a snag: ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, apiKeys.tmdb, apiKeys.groq]);

  const loadNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      const start = (nextPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      setRecommendations(allRecommendations.slice(start, end));
      setCurrentPage(nextPage);
    }
  }, [currentPage, totalPages, allRecommendations, ITEMS_PER_PAGE]);

  const loadPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const start = (prevPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      setRecommendations(allRecommendations.slice(start, end));
      setCurrentPage(prevPage);
    }
  }, [currentPage, allRecommendations, ITEMS_PER_PAGE]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    window.localStorage.removeItem("cineMatch_history");
  }, []);

  const toggleFavorite = useCallback((movieId: number) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId];
      window.localStorage.setItem("cineMatch_favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setMessages([{ role: "assistant", content: WELCOME }]);
    setRecommendations([]);
    setAllRecommendations([]);
    setActorData(null);
    setCurrentPage(1);
    setTotalPages(1);
    setStatus("idle");
    setStatusLabel("");
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const storedHistory = window.localStorage.getItem("cineMatch_history");
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch {
        window.localStorage.removeItem("cineMatch_history");
      }
    }

    const storedFavorites = window.localStorage.getItem("cineMatch_favorites");
    if (storedFavorites) {
      try {
        setFavoriteIds(JSON.parse(storedFavorites));
      } catch {
        window.localStorage.removeItem("cineMatch_favorites");
      }
    }
  }, []);

  return {
    messages,
    status,
    statusLabel,
    recommendations,
    error,
    loading,
    apiKeys,
    history,
    favoriteIds,
    actorData,
    currentPage,
    totalPages,
    sendMessage,
    clearHistory,
    toggleFavorite,
    loadNextPage,
    loadPreviousPage,
    reset,
  };
}

async function fetchCandidates(
  preferences: ExtractedPreferences,
  language?: string
) {
  let candidates = [];

  if (language) {
    candidates = await discoverByLanguage(language, preferences.genreIds);
  } else {
    candidates = await discoverByGenre(
      preferences.genreIds,
      preferences.yearFrom,
      preferences.yearTo
    );
  }

  if (preferences.searchQuery) {
    const searchResults = await searchMovies(preferences.searchQuery);
    if (searchResults.length > 0) {
      const similar = await getSimilarMovies(searchResults[0].id);
      candidates = [...similar, ...searchResults, ...candidates];
    }
  }

  const seen = new Set<number>();
  candidates = candidates.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  if (candidates.length < 5 && preferences.genreIds.length > 0) {
    const broader = await discoverByGenre(preferences.genreIds.slice(0, 1));
    for (const m of broader) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        candidates.push(m);
      }
    }
  }

  if (candidates.length === 0) {
    candidates = await discoverByGenre([], undefined, undefined);
  }

  return candidates.slice(0, 25);
}

async function enrichRecommendations(
  picks: { tmdb_id: number; why_watch: string; highlight: string; title: string }[]
): Promise<EnrichedRecommendation[]> {
  const results = await Promise.all(
    picks.map(async (pick) => {
      const [details, trailerKey] = await Promise.all([
        getMovieDetails(pick.tmdb_id),
        getTrailerKey(pick.tmdb_id),
      ]);

      return {
        id: details.id,
        title: details.title,
        overview: details.overview,
        vote_average: details.vote_average,
        release_date: details.release_date,
        poster_path: details.poster_path,
        poster_url: posterUrl(details.poster_path),
        runtime: details.runtime,
        genres: details.genres.map((g) => g.name),
        why_watch: pick.why_watch,
        highlight: pick.highlight,
        trailer_key: trailerKey,
      };
    })
  );

  return results;
}

// Determine if a query should use featured movies
function shouldUseFeaturedMovies(
  message: string,
  preferences: ExtractedPreferences
): boolean {
  const lower = message.toLowerCase();
  
  // Check for explicit featured/top/best requests
  if (/\b(featured|top\s+(rated|movies)|best\s+(rated|movies)|highest\s+rated)\b/.test(lower)) {
    return true;
  }
  
  // Check for rating range queries (e.g., "7.8 to 7.9 rating")
  if (/\d+\.\d+\s*(to|-)\s*\d+\.\d+\s+rating/i.test(lower) ||
      /rating\s+(of\s+)?\d+\.\d+\s*(to|-)\s*\d+\.\d+/i.test(lower)) {
    return true;
  }
  
  // Check for genre queries with specific intent
  if (preferences.genreNames.length > 0) {
    // If user asks for "best", "top", "featured" in combination with genre
    if (/\b(best|top|featured|recommended)\b/.test(lower)) {
      return true;
    }
    // If it's a simple genre request without other specific criteria
    if (!preferences.searchQuery && !preferences.yearFrom && !preferences.yearTo) {
      return true;
    }
  }
  
  return false;
}
