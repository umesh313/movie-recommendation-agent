import type { MovieDetails, MovieSummary } from "@/types/movie";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

let genreCache: { id: number; name: string }[] | null = null;

function getApiKey(): string {
  const key = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
  if (!key) {
    throw new Error(
      "Missing VITE_TMDB_API_KEY. Add it to your .env file."
    );
  }
  return key;
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB API error (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export function posterUrl(path: string | null, size: "w342" | "w500" | "original" = "w500"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export async function getGenres(): Promise<{ id: number; name: string }[]> {
  if (genreCache) return genreCache;
  const data = await tmdbFetch<{ genres: { id: number; name: string }[] }>("/genre/movie/list");
  genreCache = data.genres;
  return genreCache;
}

export async function discoverByGenre(
  genreIds: number[],
  yearFrom?: number,
  yearTo?: number
): Promise<MovieSummary[]> {
  const params: Record<string, string> = {
    sort_by: "vote_average.desc",
    "vote_count.gte": "200",
    include_adult: "false",
  };

  if (genreIds.length > 0) {
    params.with_genres = genreIds.join(",");
  }
  if (yearFrom) {
    params["primary_release_date.gte"] = `${yearFrom}-01-01`;
  }
  if (yearTo) {
    params["primary_release_date.lte"] = `${yearTo}-12-31`;
  }

  const data = await tmdbFetch<{ results: MovieSummary[] }>("/discover/movie", params);
  return data.results.filter((m) => m.poster_path && m.overview);
}

export async function searchMovies(query: string): Promise<MovieSummary[]> {
  const data = await tmdbFetch<{ results: MovieSummary[] }>("/search/movie", {
    query,
    include_adult: "false",
  });
  return data.results.filter((m) => m.poster_path && m.overview);
}

export async function getSimilarMovies(movieId: number): Promise<MovieSummary[]> {
  const data = await tmdbFetch<{ results: MovieSummary[] }>(`/movie/${movieId}/similar`);
  return data.results.filter((m) => m.poster_path && m.overview);
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  return tmdbFetch<MovieDetails>(`/movie/${id}`);
}

export async function getTrailerKey(id: number): Promise<string | null> {
  const data = await tmdbFetch<{ results: { key: string; site: string; type: string }[] }>(
    `/movie/${id}/videos`
  );
  const trailer = data.results.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );
  return trailer?.key ?? null;
}

export function compactMovieForAgent(movies: MovieSummary[]) {
  return movies.slice(0, 20).map((m) => ({
    tmdb_id: m.id,
    title: m.title,
    rating: Math.round(m.vote_average * 10) / 10,
    year: m.release_date?.slice(0, 4) ?? "Unknown",
    overview: m.overview.slice(0, 180) + (m.overview.length > 180 ? "…" : ""),
  }));
}

export async function matchGenreNames(names: string[]): Promise<number[]> {
  const genres = await getGenres();
  const ids: number[] = [];
  for (const name of names) {
    const match = genres.find(
      (g) => g.name.toLowerCase() === name.toLowerCase()
    );
    if (match) ids.push(match.id);
  }
  return ids;
}

export function keywordMatchGenres(input: string, genres: { id: number; name: string }[]): number[] {
  const lower = input.toLowerCase();
  const aliases: Record<string, string[]> = {
    "sci-fi": ["Science Fiction"],
    scifi: ["Science Fiction"],
    "science fiction": ["Science Fiction"],
    romcom: ["Romance", "Comedy"],
    romcoms: ["Romance", "Comedy"],
    superhero: ["Action", "Adventure"],
    animated: ["Animation"],
    cartoon: ["Animation"],
    scary: ["Horror"],
    spooky: ["Horror"],
  };

  const matched = new Set<number>();

  for (const genre of genres) {
    if (lower.includes(genre.name.toLowerCase())) {
      matched.add(genre.id);
    }
  }

  for (const [alias, genreNames] of Object.entries(aliases)) {
    if (lower.includes(alias)) {
      for (const gn of genreNames) {
        const g = genres.find((x) => x.name === gn);
        if (g) matched.add(g.id);
      }
    }
  }

  return Array.from(matched);
}
