import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { TasteProfile, FavoriteMovie, ConversationContext } from "@/types/movie";

interface TasteProfileContextType {
  profile: TasteProfile | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  conversationContext: ConversationContext;
  setProfile: (profile: TasteProfile | null) => void;
  addFavoriteMovie: (movie: FavoriteMovie) => void;
  removeFavoriteMovie: (tmdbId: number) => void;
  updateProfile: (updates: Partial<TasteProfile>) => void;
  generateProfileSummary: (profile: TasteProfile) => Promise<string>;
  likeMovie: (movieId: number) => void;
  dislikeMovie: (movieId: number) => void;
  resetConversationContext: () => void;
  clearProfile: () => void;
}

const TasteProfileContext = createContext<TasteProfileContextType | undefined>(undefined);

const STORAGE_KEY = "cineMatch_tasteProfile";
const CONVERSATION_KEY = "cineMatch_conversationContext";

const defaultProfile: TasteProfile = {
  favoriteMovies: [],
  preferredGenres: [],
  favoriteActors: [],
  favoriteDirectors: [],
  dislikedGenres: [],
  dislikedMovies: [],
  preferredMoods: [],
  preferredEras: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultConversationContext: ConversationContext = {
  previousRecommendations: [],
  likedMovies: [],
  dislikedMovies: [],
  lastGenres: [],
  lastMood: undefined,
  refinementCount: 0,
  sessionStart: new Date().toISOString(),
};

export function TasteProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<TasteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversationContext, setConversationContext] = useState<ConversationContext>(defaultConversationContext);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TasteProfile;
        setProfileState(parsed);
      }
    } catch (e) {
      console.error("Failed to load taste profile:", e);
    }

    try {
      const storedConv = localStorage.getItem(CONVERSATION_KEY);
      if (storedConv) {
        const parsed = JSON.parse(storedConv) as ConversationContext;
        setConversationContext(parsed);
      }
    } catch (e) {
      console.error("Failed to load conversation context:", e);
    }

    setIsLoading(false);
  }, []);

  // Save profile to localStorage whenever it changes
  const setProfile = useCallback((newProfile: TasteProfile | null) => {
    setProfileState(newProfile);
    if (newProfile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<TasteProfile>) => {
    setProfileState((prev) => {
      const current = prev || defaultProfile;
      const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addFavoriteMovie = useCallback((movie: FavoriteMovie) => {
    setProfileState((prev) => {
      const current = prev || defaultProfile;
      if (current.favoriteMovies.some((m) => m.tmdbId === movie.tmdbId)) return current;
      const updated = {
        ...current,
        favoriteMovies: [...current.favoriteMovies, movie],
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFavoriteMovie = useCallback((tmdbId: number) => {
    setProfileState((prev) => {
      const current = prev || defaultProfile;
      const updated = {
        ...current,
        favoriteMovies: current.favoriteMovies.filter((m) => m.tmdbId !== tmdbId),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const likeMovie = useCallback((movieId: number) => {
    setConversationContext((prev) => {
      const updated = {
        ...prev,
        likedMovies: [...prev.likedMovies.filter((id) => id !== movieId), movieId],
        dislikedMovies: prev.dislikedMovies.filter((id) => id !== movieId),
      };
      localStorage.setItem(CONVERSATION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const dislikeMovie = useCallback((movieId: number) => {
    setConversationContext((prev) => {
      const updated = {
        ...prev,
        dislikedMovies: [...prev.dislikedMovies.filter((id) => id !== movieId), movieId],
        likedMovies: prev.likedMovies.filter((id) => id !== movieId),
      };
      localStorage.setItem(CONVERSATION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetConversationContext = useCallback(() => {
    const newContext = { ...defaultConversationContext, sessionStart: new Date().toISOString() };
    setConversationContext(newContext);
    localStorage.setItem(CONVERSATION_KEY, JSON.stringify(newContext));
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState(null);
    localStorage.removeItem(STORAGE_KEY);
    setConversationContext(defaultConversationContext);
    localStorage.setItem(CONVERSATION_KEY, JSON.stringify(defaultConversationContext));
  }, []);

  const generateProfileSummary = useCallback(async (currentProfile: TasteProfile): Promise<string> => {
    // This will be called from the component after we have the Groq API available
    // For now, return a placeholder that will be replaced by AI-generated summary
    const genres = currentProfile.preferredGenres.join(", ") || "varied";
    const actors = currentProfile.favoriteActors.slice(0, 3).join(", ");
    const directors = currentProfile.favoriteDirectors.slice(0, 3).join(", ");
    const favorites = currentProfile.favoriteMovies.slice(0, 3).map((m) => m.title).join(", ");

    return `Based on your preferences, you enjoy ${genres} films. ${favorites ? `Your favorites include ${favorites}.` : ""}${actors ? ` You're a fan of ${actors}.` : ""}${directors ? ` You appreciate films by ${directors}.` : ""}`;
  }, []);

  const hasCompletedOnboarding = profile ? profile.favoriteMovies.length > 0 || profile.preferredGenres.length > 0 : false;

  return (
    <TasteProfileContext.Provider
      value={{
        profile,
        isLoading,
        hasCompletedOnboarding,
        conversationContext,
        setProfile,
        addFavoriteMovie,
        removeFavoriteMovie,
        updateProfile,
        generateProfileSummary,
        likeMovie,
        dislikeMovie,
        resetConversationContext,
        clearProfile,
      }}
    >
      {children}
    </TasteProfileContext.Provider>
  );
}

export function useTasteProfile() {
  const context = useContext(TasteProfileContext);
  if (context === undefined) {
    throw new Error("useTasteProfile must be used within a TasteProfileProvider");
  }
  return context;
}