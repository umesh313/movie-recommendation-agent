import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
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
      className="flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-ink flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>
        <div>
          <h1 className="text-display-sm text-foreground leading-none">
            <span className="text-brand-gradient">CineMatch</span>
          </h1>
          <p className="text-body-sm text-ink-mute mt-0.5">
            Curated recommendations, quotes, and movie trivia in one place.
          </p>
        </div>
      </div>

      {hasResults && onReset && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="shrink-0 max-sm:text-xs max-sm:px-2 max-sm:py-1 max-sm:h-auto"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5 max-sm:h-3 max-sm:w-3 max-sm:mr-1" />
          New search
        </Button>
      )}
    </motion.header>
  );
}