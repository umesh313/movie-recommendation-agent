import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  Film, 
  Heart, 
  Laugh, 
  Sword, 
  Compass, 
  BrainCircuit, 
  BadgeAlert, 
  HeartPulse,
  Sun,
  Moon,
  ChevronLeft,
  Sparkles
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
  { id: "horror", name: "Horror", icon: <BrainCircuit className="h-4 w-4" />, genres: ["horror"] },
  { id: "comedy", name: "Comedy", icon: <Laugh className="h-4 w-4" />, genres: ["comedy"] },
  { id: "romance", name: "Romance", icon: <Heart className="h-4 w-4" />, genres: ["romance"] },
  { id: "action", name: "Action", icon: <Sword className="h-4 w-4" />, genres: ["action"] },
  { id: "adventure", name: "Adventure", icon: <Compass className="h-4 w-4" />, genres: ["adventure"] },
  { id: "thriller", name: "Psycho Thriller", icon: <BadgeAlert className="h-4 w-4" />, genres: ["thriller"] },
  { id: "crime", name: "Crime Drama", icon: <Film className="h-4 w-4" />, genres: ["crime"] },
  { id: "romcom", name: "Rom-Com", icon: <HeartPulse className="h-4 w-4" />, genres: ["romance", "comedy"] },
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
    // Close sidebar on mobile after selection
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
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg glass border border-white/10 text-foreground hover:text-cinema-gold transition-colors"
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

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isDesktop ? { x: 0 } : { x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`
          fixed left-0 top-0 h-full w-72 glass border-r border-white/10 z-50
          lg:static lg:translate-x-0 lg:z-0 lg:h-auto lg:min-h-screen
          ${isOpen ? "shadow-2xl" : ""}
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cinema-gold" />
              <span className="font-bold text-lg">CineMatch</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Categories
            </p>
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                    ${activeCategory?.id === category.id
                      ? "bg-cinema-gold/20 text-cinema-gold border border-cinema-gold/30"
                      : "hover:bg-white/5 text-foreground/80 hover:text-foreground"
                    }
                  `}
                >
                  {category.icon}
                  <span>{category.name}</span>
                  {activeCategory?.id === category.id && (
                    <ChevronLeft className="h-4 w-4 ml-auto" />
                  )}
                </button>
              ))}
            </nav>

            {/* Category Movies Preview */}
            {categoryMovies && categoryMovies.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {activeCategory?.name} Movies ({categoryMovies.length})
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categoryMovies.slice(0, 5).map((movie) => (
                    <div
                      key={movie.rank}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <span className="text-xs text-muted-foreground w-6">#{movie.rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{movie.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {movie.year} • {movie.imdbRating}/10
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/10 mt-4">
            <p className="text-xs text-muted-foreground text-center">
              {featuredMovies.length} Featured Films
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}