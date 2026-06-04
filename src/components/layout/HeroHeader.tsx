import { motion } from "framer-motion";
import { Film, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroHeaderProps {
  onReset?: () => void;
  hasResults: boolean;
}

export function HeroHeader({ onReset, hasResults }: HeroHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between gap-4 mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cinema-gold to-cinema-amber flex items-center justify-center shadow-lg shadow-cinema-gold/25">
          <Film className="h-6 w-6 text-cinema-navy" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="text-gradient-gold">CineMatch</span>
            <span className="text-foreground/80 font-sans font-normal text-lg sm:text-xl ml-2">
              Agent
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            AI-powered movie recommendations · TMDB + Groq
          </p>
        </div>
      </div>

      {hasResults && onReset && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="border-white/10 hover:border-cinema-gold/30 shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          New search
        </Button>
      )}
    </motion.header>
  );
}
