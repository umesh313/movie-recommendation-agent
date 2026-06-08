import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Heart, Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrailerModal } from "@/components/movies/TrailerModal";
import type { EnrichedRecommendation } from "@/types/movie";

interface MovieCardProps {
  movie: EnrichedRecommendation;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (movieId: number) => void;
}

export function MovieCard({
  movie,
  index,
  isFavorite,
  onToggleFavorite,
}: MovieCardProps) {
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const year = movie.release_date?.slice(0, 4) ?? "—";

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.45, ease: "easeOut" }}
        whileHover={{ y: -2 }}
        className="card-chrome-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-level-4"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Poster */}
          <div className="relative sm:w-44 shrink-0 aspect-[2/3] sm:aspect-auto sm:h-auto overflow-hidden bg-muted">
            {!posterLoaded && (
              <Skeleton className="absolute inset-0 rounded-none" />
            )}
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={`${movie.title} poster`}
                loading="lazy"
                onLoad={() => setPosterLoaded(true)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full min-h-[200px] flex items-center justify-center text-ink-mute text-body-sm">
                No poster
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:hidden" />
            <button
              type="button"
              onClick={() => onToggleFavorite(movie.id)}
              className="absolute left-2 top-2 rounded-full bg-white/90 p-1.5 text-ink shadow-level-1 transition-colors hover:bg-ink hover:text-white"
              aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col gap-3">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-display-sm text-foreground leading-tight">
                  {movie.title}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-caption text-ink-mute">
                <span>{year}</span>
                {movie.runtime && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                    </span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {movie.genres.slice(0, 3).map((g) => (
                  <Badge key={g} variant="outline" className="text-[10px] py-0">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            <p className="text-body-sm text-ink-body line-clamp-3 leading-relaxed">
              {movie.overview}
            </p>

            <div className="rounded-md bg-card p-3 mt-auto hairline-inset-light">
              <p className="eyebrow-mono text-ink-mute mb-1">
                Why watch it
              </p>
              <p className="text-body-sm text-foreground leading-relaxed">
                {movie.why_watch}
              </p>
              <p className="text-caption text-ink-mute mt-2 italic">
                {movie.highlight}
              </p>
            </div>

            {movie.trailer_key && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTrailerOpen(true)}
                className="w-fit"
              >
                <Play className="h-4 w-4 mr-1.5" />
                Watch Trailer
              </Button>
            )}
          </div>
        </div>
      </motion.article>

      {movie.trailer_key && (
        <TrailerModal
          open={trailerOpen}
          onOpenChange={setTrailerOpen}
          title={movie.title}
          trailerKey={movie.trailer_key}
        />
      )}
    </>
  );
}