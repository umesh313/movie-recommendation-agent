import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Film } from "lucide-react";
import { posterUrl, searchMovies } from "@/services/tmdb";
import { FeaturedMovieModal } from "@/components/movies/FeaturedMovieModal";
import type { FeaturedMovie } from "@/data/featuredMovies";

interface CategoryMovie extends FeaturedMovie {
  posterUrl?: string | null;
  tmdbId?: number;
}

interface CategoryMoviesProps {
  movies: FeaturedMovie[];
  categoryName: string;
}

export function CategoryMovies({ movies, categoryName }: CategoryMoviesProps) {
  const [enrichedMovies, setEnrichedMovies] = useState<CategoryMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<FeaturedMovie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setEnrichedMovies(movies.map(m => ({ ...m })));
    setLoading(true);
    fetchPosters(movies);
  }, [movies]);

  async function fetchPosters(moviesList: FeaturedMovie[]) {
    const updated: CategoryMovie[] = moviesList.map(m => ({ ...m }));
    
    for (let i = 0; i < moviesList.length; i++) {
      try {
        const results = await searchMovies(moviesList[i].title);
        if (results.length > 0) {
          updated[i].posterUrl = posterUrl(results[0].poster_path, "w342");
          updated[i].tmdbId = results[0].id;
        }
      } catch (error) {
        console.error(`Error fetching poster for ${moviesList[i].title}:`, error);
      }
      
      if (i < moviesList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    setEnrichedMovies(updated);
    setLoading(false);
  }

  function handleClick(movie: FeaturedMovie) {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMovie(null), 300);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Film className="h-12 w-12 text-cinema-gold/40 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading {categoryName} movies...</p>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Film className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">No movies found in this category</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-cinema-gold/20 to-cinema-gold/5 rounded-xl">
            <Film className="h-6 w-6 text-cinema-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{categoryName} Movies</h2>
            <p className="text-sm text-muted-foreground">
              {movies.length} featured films in this category
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {enrichedMovies.map((movie, index) => (
            <motion.div
              key={movie.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handleClick(movie)}
              className="group relative glass rounded-xl overflow-hidden border border-white/5 hover:border-cinema-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-cinema-gold/10 cursor-pointer"
            >
              <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                {movie.posterUrl ? (
                  <>
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-bold text-white/5">#{movie.rank}</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  </>
                )}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 drop-shadow-lg">
                  {movie.title}
                </h3>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">{movie.year}</span>
                  <div className="flex items-center gap-1 text-cinema-gold">
                    <span className="text-[10px]">★</span>
                    <span className="font-medium">{movie.imdbRating}</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-2 right-2 px-2 py-1 bg-cinema-gold/20 backdrop-blur-sm rounded-full text-xs text-cinema-gold font-medium">
                #{movie.rank}
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white font-medium">
                  View Details
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedMovie && (
        <FeaturedMovieModal
          movie={selectedMovie}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}