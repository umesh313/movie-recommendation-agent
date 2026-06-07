import type { ConversationContext, EnrichedRecommendation } from "@/types/movie";

const CONVERSATION_KEY = "cineMatch_conversationContext";

export function loadConversationContext(): ConversationContext {
  try {
    const stored = localStorage.getItem(CONVERSATION_KEY);
    if (stored) {
      return JSON.parse(stored) as ConversationContext;
    }
  } catch (e) {
    console.error("Failed to load conversation context:", e);
  }
  return getDefaultContext();
}

export function saveConversationContext(context: ConversationContext): void {
  try {
    localStorage.setItem(CONVERSATION_KEY, JSON.stringify(context));
  } catch (e) {
    console.error("Failed to save conversation context:", e);
  }
}

export function getDefaultContext(): ConversationContext {
  return {
    previousRecommendations: [],
    likedMovies: [],
    dislikedMovies: [],
    lastGenres: [],
    lastMood: undefined,
    refinementCount: 0,
    sessionStart: new Date().toISOString(),
  };
}

export function resetConversationContext(): ConversationContext {
  const newContext = getDefaultContext();
  saveConversationContext(newContext);
  return newContext;
}

export function addToPreviousRecommendations(context: ConversationContext, movieIds: number[]): ConversationContext {
  const newRecommendations = movieIds.filter((id) => !context.previousRecommendations.includes(id));
  return {
    ...context,
    previousRecommendations: [...context.previousRecommendations, ...newRecommendations],
  };
}

export function likeMovie(context: ConversationContext, movieId: number): ConversationContext {
  return {
    ...context,
    likedMovies: [...context.likedMovies.filter((id) => id !== movieId), movieId],
    dislikedMovies: context.dislikedMovies.filter((id) => id !== movieId),
  };
}

export function dislikeMovie(context: ConversationContext, movieId: number): ConversationContext {
  return {
    ...context,
    dislikedMovies: [...context.dislikedMovies.filter((id) => id !== movieId), movieId],
    likedMovies: context.likedMovies.filter((id) => id !== movieId),
  };
}

export function updateContextFromRecommendations(
  context: ConversationContext,
  recommendations: EnrichedRecommendation[]
): ConversationContext {
  const movieIds = recommendations.map((r) => r.id);
  const genres = [...new Set(recommendations.flatMap((r) => r.genres))];
  
  return {
    ...context,
    previousRecommendations: [...new Set([...context.previousRecommendations, ...movieIds])],
    lastGenres: genres,
  };
}

export function incrementRefinementCount(context: ConversationContext): ConversationContext {
  return {
    ...context,
    refinementCount: context.refinementCount + 1,
  };
}

export function hasSeenMovie(context: ConversationContext, movieId: number): boolean {
  return context.previousRecommendations.includes(movieId);
}

export function hasLikedMovie(context: ConversationContext, movieId: number): boolean {
  return context.likedMovies.includes(movieId);
}

export function hasDislikedMovie(context: ConversationContext, movieId: number): boolean {
  return context.dislikedMovies.includes(movieId);
}

export function getConversationSummary(context: ConversationContext): string {
  const parts: string[] = [];
  
  if (context.likedMovies.length > 0) {
    parts.push(`User liked movies with IDs: ${context.likedMovies.join(", ")}`);
  }
  
  if (context.dislikedMovies.length > 0) {
    parts.push(`User disliked movies with IDs: ${context.dislikedMovies.join(", ")}`);
  }
  
  if (context.lastGenres.length > 0) {
    parts.push(`Recent genre preferences: ${context.lastGenres.join(", ")}`);
  }
  
  if (context.lastMood) {
    parts.push(`Recent mood preference: ${context.lastMood}`);
  }
  
  if (context.refinementCount > 0) {
    parts.push(`User has refined recommendations ${context.refinementCount} times`);
  }
  
  return parts.length > 0 ? parts.join(". ") : "No conversation history yet.";
}

export function shouldShowRefinementSuggestions(context: ConversationContext): boolean {
  // Show refinement suggestions after first set of recommendations
  return context.previousRecommendations.length > 0 && context.refinementCount < 3;
}

export function getRefinementSuggestions(context: ConversationContext): string[] {
  const suggestions: string[] = [];
  
  if (context.lastGenres.length > 0) {
    suggestions.push(`More ${context.lastGenres[0]} movies`);
  }
  
  if (context.previousRecommendations.length > 0) {
    suggestions.push("Something similar");
    suggestions.push("Something different");
  }
  
  suggestions.push("Newer movies only");
  suggestions.push("Less dark");
  suggestions.push("More popular films");
  suggestions.push("Hidden gems");
  
  return suggestions.slice(0, 4);
}