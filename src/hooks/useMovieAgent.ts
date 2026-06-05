import { useCallback, useEffect, useState } from "react";
import {
  answerMovieQuestion,
  checkApiKeys,
  extractPreferences,
  getFallbackRecommendations,
  isQuoteOrMovieFactRequest,
  recommendMovies,
} from "@/services/agentService";
import {
  compactMovieForAgent,
  discoverByGenre,
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
} from "@/types/movie";

const WELCOME =
  "Hi! I'm CineMatch — your personal movie curator. Tell me what you're in the mood for: a genre, era, vibe, or a film you loved.";

export function useMovieAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [statusLabel, setStatusLabel] = useState("");
  const [recommendations, setRecommendations] = useState<EnrichedRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiKeys = checkApiKeys();

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
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 10);
      window.localStorage.setItem("cineMatch_history", JSON.stringify(next));
      return next;
    });

    try {
      if (await isQuoteOrMovieFactRequest(trimmed)) {
        setStatus("extracting");
        setStatusLabel("Searching movie knowledge…");
        const answer = await answerMovieQuestion(trimmed);

        setMessages((m) => [
          ...m,
          { role: "assistant", content: answer.intro },
        ]);
        setRecommendations([]);
        setStatus("done");
        setStatusLabel("");
        return;
      }

      setStatus("extracting");
      setStatusLabel("Understanding your taste…");
      const preferences: ExtractedPreferences = await extractPreferences(trimmed);

      setStatus("searching");
      setStatusLabel("Searching TMDB…");
      let candidates = await fetchCandidates(preferences);

      if (candidates.length === 0) {
        candidates = await discoverByGenre([], undefined, undefined);
      }

      const compact = compactMovieForAgent(candidates);

      setStatus("recommending");
      setStatusLabel("Curating your picks…");
      let agentResponse;
      try {
        agentResponse = await recommendMovies(trimmed, preferences, compact);
      } catch {
        agentResponse = await getFallbackRecommendations(candidates);
      }

      setStatus("enriching");
      setStatusLabel("Loading posters & trailers…");
      const enriched = await enrichRecommendations(agentResponse.recommendations ?? []);

      setRecommendations(enriched);
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
    sendMessage,
    clearHistory,
    toggleFavorite,
    reset,
  };
}

async function fetchCandidates(
  preferences: ExtractedPreferences
) {
  let candidates = await discoverByGenre(
    preferences.genreIds,
    preferences.yearFrom,
    preferences.yearTo
  );

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
