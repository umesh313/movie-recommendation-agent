import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Sparkles, Film, Users, Clapperboard, Heart, Star, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTasteProfile } from "@/contexts/TasteProfileContext";
import type { FavoriteMovie } from "@/types/movie";

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
  "Romance", "Science Fiction", "TV Movie", "Thriller", "War", "Western"
];

const ERAS = [
  "1920s", "1930s", "1940s", "1950s", "1960s", "1970s",
  "1980s", "1990s", "2000s", "2010s", "2020s"
];

interface TasteProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TasteProfilePanel({ isOpen, onClose }: TasteProfilePanelProps) {
  const { profile, setProfile, updateProfile, addFavoriteMovie, removeFavoriteMovie, generateProfileSummary: generateSummary } = useTasteProfile();
  
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newActor, setNewActor] = useState("");
  const [newDirector, setNewDirector] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  const handleAddMovie = () => {
    if (!newMovieTitle.trim()) return;
    
    const movie: FavoriteMovie = {
      title: newMovieTitle.trim(),
      year: undefined,
      reason: undefined,
    };
    
    addFavoriteMovie(movie);
    setNewMovieTitle("");
  };

  const handleToggleGenre = (genre: string) => {
    if (!localProfile) return;
    const currentGenres = localProfile.preferredGenres;
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre];
    
    setLocalProfile({ ...localProfile, preferredGenres: newGenres });
    updateProfile({ preferredGenres: newGenres });
  };

  const handleToggleEra = (era: string) => {
    if (!localProfile) return;
    const currentEras = localProfile.preferredEras;
    const newEras = currentEras.includes(era)
      ? currentEras.filter(e => e !== era)
      : [...currentEras, era];
    
    setLocalProfile({ ...localProfile, preferredEras: newEras });
    updateProfile({ preferredEras: newEras });
  };

  const handleAddActor = () => {
    if (!newActor.trim() || !localProfile) return;
    const actors = [...localProfile.favoriteActors, newActor.trim()];
    setLocalProfile({ ...localProfile, favoriteActors: actors });
    updateProfile({ favoriteActors: actors });
    setNewActor("");
  };

  const handleAddDirector = () => {
    if (!newDirector.trim() || !localProfile) return;
    const directors = [...localProfile.favoriteDirectors, newDirector.trim()];
    setLocalProfile({ ...localProfile, favoriteDirectors: directors });
    updateProfile({ favoriteDirectors: directors });
    setNewDirector("");
  };

  const handleRemoveActor = (actor: string) => {
    if (!localProfile) return;
    const actors = localProfile.favoriteActors.filter(a => a !== actor);
    setLocalProfile({ ...localProfile, favoriteActors: actors });
    updateProfile({ favoriteActors: actors });
  };

  const handleRemoveDirector = (director: string) => {
    if (!localProfile) return;
    const directors = localProfile.favoriteDirectors.filter(d => d !== director);
    setLocalProfile({ ...localProfile, favoriteDirectors: directors });
    updateProfile({ favoriteDirectors: directors });
  };

  const handleGenerateSummary = async () => {
    if (!localProfile) return;
    setIsGenerating(true);
    try {
      const summary = await generateSummary(localProfile);
      updateProfile({ profileSummary: summary });
      setLocalProfile({ ...localProfile, profileSummary: summary });
    } catch (error) {
      console.error("Failed to generate summary:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (localProfile) {
      setProfile(localProfile);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-card/95 backdrop-blur">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-cinema-gold" />
                Your Taste Profile
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Help us understand your movie preferences
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 space-y-8">
            {/* Favorite Movies */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Film className="h-5 w-5 text-cinema-gold" />
                Favorite Movies
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add 3-5 of your all-time favorite films
              </p>
              
              <div className="flex gap-2 mb-3">
                <Input
                  value={newMovieTitle}
                  onChange={(e) => setNewMovieTitle(e.target.value)}
                  placeholder="Enter movie title..."
                  onKeyDown={(e) => e.key === "Enter" && handleAddMovie()}
                  className="bg-background/60"
                />
                <Button onClick={handleAddMovie} variant="cinema" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {localProfile?.favoriteMovies.map((movie, idx) => (
                  <Badge key={`${movie.title}-${idx}`} variant="gold" className="px-3 py-1 gap-2">
                    {movie.title}
                    <button
                      onClick={() => removeFavoriteMovie(movie.tmdbId || idx)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {localProfile?.favoriteMovies.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No favorite movies added yet</p>
                )}
              </div>
            </section>

            {/* Preferred Genres */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clapperboard className="h-5 w-5 text-cinema-gold" />
                Preferred Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleToggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      localProfile?.preferredGenres.includes(genre)
                        ? "bg-cinema-gold text-cinema-navy shadow-lg shadow-cinema-gold/20"
                        : "glass hover:bg-white/10 text-foreground"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </section>

            {/* Favorite Actors */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-cinema-gold" />
                Favorite Actors
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newActor}
                  onChange={(e) => setNewActor(e.target.value)}
                  placeholder="Enter actor name..."
                  onKeyDown={(e) => e.key === "Enter" && handleAddActor()}
                  className="bg-background/60"
                />
                <Button onClick={handleAddActor} variant="cinema" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {localProfile?.favoriteActors.map((actor) => (
                  <Badge key={actor} variant="outline" className="gap-2">
                    {actor}
                    <button
                      onClick={() => handleRemoveActor(actor)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </section>

            {/* Favorite Directors */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clapperboard className="h-5 w-5 text-cinema-gold" />
                Favorite Directors
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newDirector}
                  onChange={(e) => setNewDirector(e.target.value)}
                  placeholder="Enter director name..."
                  onKeyDown={(e) => e.key === "Enter" && handleAddDirector()}
                  className="bg-background/60"
                />
                <Button onClick={handleAddDirector} variant="cinema" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {localProfile?.favoriteDirectors.map((director) => (
                  <Badge key={director} variant="outline" className="gap-2">
                    {director}
                    <button
                      onClick={() => handleRemoveDirector(director)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </section>

            {/* Preferred Eras */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-cinema-gold" />
                Preferred Eras
              </h3>
              <div className="flex flex-wrap gap-2">
                {ERAS.map((era) => (
                  <button
                    key={era}
                    onClick={() => handleToggleEra(era)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      localProfile?.preferredEras.includes(era)
                        ? "bg-cinema-gold text-cinema-navy shadow-lg shadow-cinema-gold/20"
                        : "glass hover:bg-white/10 text-foreground"
                    }`}
                  >
                    {era}
                  </button>
                ))}
              </div>
            </section>

            {/* AI-Generated Summary */}
            {localProfile?.profileSummary && (
              <section className="rounded-2xl border border-cinema-gold/20 bg-cinema-gold/5 p-4">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-cinema-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-cinema-gold text-sm mb-1">Your Movie Taste</h4>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {localProfile.profileSummary}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <Button
                onClick={handleGenerateSummary}
                disabled={isGenerating || !localProfile}
                variant="outline"
                className="flex-1 border-cinema-gold/30 text-cinema-gold hover:bg-cinema-gold/10"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate AI Summary
              </Button>
              <Button
                onClick={handleSave}
                variant="cinema"
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}