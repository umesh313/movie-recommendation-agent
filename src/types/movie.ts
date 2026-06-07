export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface MovieSummary {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  poster_path: string | null;
  genre_ids?: number[];
}

export interface MovieDetails extends MovieSummary {
  runtime: number | null;
  genres: { id: number; name: string }[];
  tagline?: string;
  director?: string;
  cast?: string[];
}

export interface ExtractedPreferences {
  genreIds: number[];
  genreNames: string[];
  yearFrom?: number;
  yearTo?: number;
  searchQuery?: string;
  mood?: string;
}

export interface AgentRecommendation {
  tmdb_id: number;
  title: string;
  why_watch: string;
  highlight: string;
}

export interface AgentResponse {
  intro: string;
  recommendations?: AgentRecommendation[];
}

export interface EnrichedRecommendation {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  poster_path: string | null;
  poster_url: string | null;
  runtime: number | null;
  genres: string[];
  why_watch: string;
  highlight: string;
  trailer_key: string | null;
  director?: string;
  cast?: string[];
  matchScore?: number;
  rtScore?: number;
  streamingInfo?: StreamingInfo[];
}

export interface StreamingInfo {
  provider: string;
  type: "rent" | "buy" | "flatrate";
  link?: string;
}

export type AgentStatus =
  | "idle"
  | "extracting"
  | "searching"
  | "recommending"
  | "enriching"
  | "done"
  | "error";

export interface Person {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  profile_path: string | null;
  popularity: number;
  profile_url: string | null;
}

export interface PersonCredits {
  movies: EnrichedRecommendation[];
  tvShows: (EnrichedRecommendation & { first_air_date?: string })[];
}

export interface PersonResponse {
  intro: string;
  person: Person;
  credits: PersonCredits;
}

export type QueryType = "actor" | "recommendation" | "quote" | "tvshow" | "general_movie_fact" | "non_movie";

export interface ExtractedPreferencesWithLanguage extends ExtractedPreferences {
  language?: string;
  contentTypes?: ("movie" | "tv")[];
}

export interface RecommendationPageData {
  items: EnrichedRecommendation[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  hasNextPage: boolean;
}

// Taste Profile Types
export interface TasteProfile {
  favoriteMovies: FavoriteMovie[];
  preferredGenres: string[];
  favoriteActors: string[];
  favoriteDirectors: string[];
  dislikedGenres: string[];
  dislikedMovies: string[];
  preferredMoods: string[];
  preferredEras: string[];
  profileSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteMovie {
  title: string;
  tmdbId?: number;
  year?: string;
  reason?: string;
}

// Conversation Memory Types
export interface ConversationContext {
  previousRecommendations: number[]; // tmdb_ids
  likedMovies: number[]; // tmdb_ids
  dislikedMovies: number[]; // tmdb_ids
  lastGenres: string[];
  lastMood?: string;
  refinementCount: number;
  sessionStart: string;
}

// Watchlist Types
export type WatchlistStatus = "want_to_watch" | "watching" | "watched";

export interface WatchlistItem {
  movieId: number;
  title: string;
  status: WatchlistStatus;
  userRating?: number; // 1-10
  addedAt: string;
  watchedAt?: string;
  notes?: string;
}

// Mood Categories
export interface MoodCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  associatedGenres: number[];
  keywords: string[];
}

// Discovery Mode
export type DiscoveryMode = "popular" | "hidden_gems" | "underrated" | "cult_classics";

// Filter State
export interface FilterState {
  genres: number[];
  yearFrom?: number;
  yearTo?: number;
  minRating?: number;
  maxRuntime?: number;
  minRuntime?: number;
  language?: string;
  discoveryMode?: DiscoveryMode;
  moods?: string[];
  hasTrailer?: boolean;
}