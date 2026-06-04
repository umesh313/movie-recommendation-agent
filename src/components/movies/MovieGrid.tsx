import { motion } from "framer-motion";
import { Clapperboard } from "lucide-react";
import { MovieCard } from "@/components/movies/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { EnrichedRecommendation } from "@/types/movie";

interface MovieGridProps {
  recommendations: EnrichedRecommendation[];
  loading: boolean;
}

export function MovieGrid({ recommendations, loading }: MovieGridProps) {
  if (loading && recommendations.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 max-w-sm"
        >
          <Clapperboard className="h-12 w-12 text-cinema-gold/40 mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">
            Your picks will appear here
          </h3>
          <p className="text-sm text-muted-foreground">
            Tell the agent what you're in the mood for — genre, era, vibe, or a
            movie you loved — and get curated recommendations with posters and
            trailers.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Clapperboard className="h-5 w-5 text-cinema-gold" />
        <h2 className="font-display text-xl font-bold">
          Your Recommendations
        </h2>
        <span className="text-sm text-muted-foreground">
          ({recommendations.length} picks)
        </span>
      </div>
      {recommendations.map((movie, i) => (
        <MovieCard key={movie.id} movie={movie} index={i} />
      ))}
    </motion.div>
  );
}
