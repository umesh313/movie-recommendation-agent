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
