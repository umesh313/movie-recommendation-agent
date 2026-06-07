import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Clock, Calendar, Play, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrailerModal } from "@/components/movies/TrailerModal";
import { posterUrl } from "@/services/tmdb";
import type { FeaturedMovie } from "@/data/featuredMovies";

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  poster_path: string | null;
  trailer_key: string | null;
}

interface FeaturedMovieModalProps {
  movie: FeaturedMovie;
  isOpen: boolean;
  onClose: () => void;
}

export function FeaturedMovieModal({ movie, isOpen, onClose }: FeaturedMovieModalProps) {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && movie) {
      fetchMovieDetails();
    }
  }, [isOpen, movie]);

  async function fetchMovieDetails() {
    setLoading(true);
    try {
      // Search for the movie to get TMDB ID
      const searchResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}&include_adult=false`
      );
      const searchData = await searchResponse.json();
      
      if (searchData.results && searchData.results.length > 0) {
        const movieId = searchData.results[0].id;
        
        // Fetch full movie details
        const detailsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const detailsData = await detailsResponse.json();
        
        // Fetch trailer
        let trailerKey = null;
        try {
          const videosResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
          );
          const videosData = await videosResponse.json();
          
          const trailer = videosData.results?.find(
            (v: any) => v.site === "YouTube" && v.type === "Trailer"
          ) || videosData.results?.find(
            (v: any) => v.site === "YouTube" && v.type === "Teaser"
          );
          
          if (trailer) {
            trailerKey = trailer.key;
          }
        } catch {
          // Trailer fetch failed, continue without it
        }

        setDetails({
          id: movieId,
          title: detailsData.title,
          overview: detailsData.overview,
          vote_average: detailsData.vote_average,
          release_date: detailsData.release_date,
          runtime: detailsData.runtime,
          genres: detailsData.genres || [],
          poster_path: detailsData.poster_path,
          trailer_key: trailerKey,
        });
      }
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setLoading(false);
    }
  }

  const year = details?.release_date?.slice(0, 4) ?? movie.year.toString();
  const posterUrlString = details?.poster_path ? posterUrl(details.poster_path, "w500") : null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto glass rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
                {loading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="text-center">
                      <Film className="h-12 w-12 text-cinema-gold/40 mx-auto mb-4 animate-pulse" />
                      <p className="text-muted-foreground">Loading movie details...</p>
                    </div>
                  </div>
                ) : details ? (
                  <div className="relative">
                    {/* Hero section with backdrop */}
                    <div className="relative h-64 sm:h-80 overflow-hidden rounded-t-3xl">
                      {posterUrlString ? (
                        <div 
                          className="absolute inset-0 bg-cover bg-center blur-xl opacity-50"
                          style={{ backgroundImage: `url(${posterUrlString})` }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                      
                      <button
                        onClick={onClose}
                        className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white/80 hover:bg-black/70 hover:text-white transition-colors z-10"
                      >
                        <X className="h-5 w-5" />
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 p-6 flex gap-6 items-end">
                        {posterUrlString ? (
                          <div className="relative shrink-0 hidden sm:block">
                            {!posterLoaded && (
                              <div className="w-32 h-48 bg-gray-800 rounded-lg animate-pulse" />
                            )}
                            <img
                              src={posterUrlString}
                              alt={details.title}
                              className="w-32 h-48 object-cover rounded-lg shadow-2xl"
                              onLoad={() => setPosterLoaded(true)}
                            />
                          </div>
                        ) : null}
                        
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold mb-2">{details.title}</h2>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 text-cinema-gold">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="font-semibold">{details.vote_average.toFixed(1)}</span>
                              <span className="text-muted-foreground">/10</span>
                            </div>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{year}</span>
                            </div>
                            {details.runtime && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>
                                </div>
                            </>
                            )}
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Star className="h-4 w-4" />
                              <span>IMDb: {movie.imdbRating}/10</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                      {/* Genres */}
                      {details.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {details.genres.slice(0, 5).map((genre) => (
                            <Badge key={genre.id} variant="outline" className="text-xs">
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Overview */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">About</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {details.overview || "No description available."}
                        </p>
                      </div>

                      {/* Why Watch */}
                      <div className="rounded-xl border border-cinema-gold/20 bg-cinema-gold/5 p-4">
                        <h3 className="text-sm font-semibold text-cinema-gold uppercase tracking-wide mb-2">
                          Why You Should Watch
                        </h3>
                        <p className="text-foreground/90 leading-relaxed">
                          Rated {movie.imdbRating}/10 on IMDb with {movie.votes} votes. 
                          This critically acclaimed film from {year} is part of our curated 
                          collection of the finest movies. {details.genres.slice(0, 2).map(g => g.name).join(" and ")} 
                          {details.genres.length > 2 ? " and more" : ""} genre film 
                          that showcases exceptional storytelling and cinematography.
                        </p>
                        <p className="text-xs text-muted-foreground mt-3 italic">
                          Featured Pick #{movie.rank} • Handpicked for quality
                        </p>
                      </div>

                      {/* Trailer */}
                      {details.trailer_key && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Trailer</h3>
                          <Button
                            onClick={() => setTrailerOpen(true)}
                            className="w-full sm:w-auto border-cinema-gold/30 hover:bg-cinema-gold/10 hover:text-cinema-gold"
                            variant="outline"
                            size="lg"
                          >
                            <Play className="h-4 w-4 mr-2 fill-current" />
                            Watch Trailer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-muted-foreground">Failed to load movie details.</p>
                    <Button onClick={onClose} variant="outline" className="mt-4">
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trailer Modal */}
      {details?.trailer_key && (
        <TrailerModal
          open={trailerOpen}
          onOpenChange={setTrailerOpen}
          title={details.title}
          trailerKey={details.trailer_key}
        />
      )}
    </>
  );
}