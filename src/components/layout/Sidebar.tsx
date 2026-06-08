import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  Sun,
  Moon,
  ChevronLeft,
  Clapperboard,
  Swords,
  Drama,
  Laugh,
  Skull,
  Heart,
  Eye,
  ScanFace,
  Telescope,
  Ghost,
  Siren,
  Lightbulb,
  Music,
  Landmark,
  Rocket,
  Gavel,
  Pencil,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { featuredMovies, getFeaturedMoviesByGenre } from "@/data/featuredMovies";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  genres: string[];
}

const categories: Category[] = [
  { id: "action", name: "Action", icon: <Swords className="h-4 w-4" />, genres: ["action"] },
  { id: "adventure", name: "Adventure", icon: <Telescope className="h-4 w-4" />, genres: ["adventure"] },
  { id: "animation", name: "Animation", icon: <Pencil className="h-4 w-4" />, genres: ["animation"] },
  { id: "biography", name: "Biography", icon: <Pencil className="h-4 w-4" />, genres: ["biography"] },
  { id: "comedy", name: "Comedy", icon: <Laugh className="h-4 w-4" />, genres: ["comedy"] },
  { id: "crime", name: "Crime", icon: <Gavel className="h-4 w-4" />, genres: ["crime"] },
  { id: "documentary", name: "Documentary", icon: <Lightbulb className="h-4 w-4" />, genres: ["documentary"] },
  { id: "drama", name: "Drama", icon: <Drama className="h-4 w-4" />, genres: ["drama"] },
  { id: "family", name: "Family", icon: <Heart className="h-4 w-4" />, genres: ["family"] },
  { id: "fantasy", name: "Fantasy", icon: <Ghost className="h-4 w-4" />, genres: ["fantasy"] },
  { id: "history", name: "History", icon: <Landmark className="h-4 w-4" />, genres: ["history"] },
  { id: "horror", name: "Horror", icon: <Skull className="h-4 w-4" />, genres: ["horror"] },
  { id: "musical", name: "Musical", icon: <Music className="h-4 w-4" />, genres: ["musical"] },
  { id: "mystery", name: "Mystery", icon: <ScanFace className="h-4 w-4" />, genres: ["mystery"] },
  { id: "romance", name: "Romance", icon: <Heart className="h-4 w-4" />, genres: ["romance"] },
  { id: "scifi", name: "Sci-Fi", icon: <Rocket className="h-4 w-4" />, genres: ["sci-fi", "science fiction"] },
  { id: "thriller", name: "Thriller", icon: <Eye className="h-4 w-4" />, genres: ["thriller"] },
  { id: "war", name: "War", icon: <Siren className="h-4 w-4" />, genres: ["war"] },
  { id: "western", name: "Western", icon: <Swords className="h-4 w-4" />, genres: [] },
  { id: "sport", name: "Sport", icon: <Swords className="h-4 w-4" />, genres: ["sport"] },
];

interface SidebarProps {
  onCategorySelect?: (category: Category, movies: typeof featuredMovies) => void;
  selectedCategory?: string | null;
}

export function Sidebar({ onCategorySelect }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const { theme, toggleTheme } = useTheme();
  const [categoryMovies, setCategoryMovies] = useState<typeof featuredMovies | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleCategoryClick(category: Category) {
    const movies = getFeaturedMoviesByGenre(category.genres);
    setCategoryMovies(movies);
    setActiveCategory(category);
    if (onCategorySelect) {
      onCategorySelect(category, movies);
    }
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setCategoryMovies(null);
    setActiveCategory(null);
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-background text-foreground shadow-level-2 transition-colors hover:bg-canvas-soft"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Nav */}
      <motion.aside
        initial={false}
        animate={isDesktop ? { x: 0 } : { x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`
          fixed left-0 top-0 h-full w-72 bg-background border-r border-border z-50
          lg:static lg:translate-x-0 lg:z-0 lg:min-h-screen
          ${isOpen ? "shadow-2xl" : ""}
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clapperboard className="h-5 w-5 text-ink" />
              <span className="font-semibold text-body-sm-strong text-ink">CineMatch</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-canvas-soft transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="lg:hidden p-2 rounded-full hover:bg-canvas-soft transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto">
            <p className="eyebrow-mono text-ink-mute mb-3 px-1">
              Categories
            </p>
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm text-left transition-all
                    ${activeCategory?.id === category.id
                      ? "bg-ink text-white font-medium"
                      : "text-ink-body hover:bg-canvas-soft hover:text-ink"
                    }
                  `}
                >
                  {category.icon}
                  <span className="flex-1">{category.name}</span>
                  {activeCategory?.id === category.id && (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </button>
              ))}
            </nav>

            {/* Category Movies Preview */}
            {categoryMovies && categoryMovies.length > 0 && (
              <div className="mt-6">
                <p className="eyebrow-mono text-ink-mute mb-3 px-1">
                  {activeCategory?.name} Movies ({categoryMovies.length})
                </p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {categoryMovies.slice(0, 5).map((movie) => (
                    <div
                      key={movie.rank}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm text-ink-body hover:bg-canvas-soft hover:text-ink transition-colors cursor-pointer"
                    >
                      <span className="text-ink-mute w-5 shrink-0 text-caption">#{movie.rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{movie.title}</p>
                        <p className="text-caption text-ink-mute">
                          {movie.year} · {movie.imdbRating}/10
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border mt-4">
            <p className="text-caption text-ink-mute text-center">
              {featuredMovies.length} Featured Films
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}