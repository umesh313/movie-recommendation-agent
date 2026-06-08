import { AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { HeroHeader } from "@/components/layout/HeroHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { FeaturedMovies } from "@/components/movies/FeaturedMovies";
import { CategoryMovies } from "@/components/movies/CategoryMovies";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { useMovieAgent } from "@/hooks/useMovieAgent";
import { ThemeProvider } from "@/contexts/ThemeContext";
import type { FeaturedMovie } from "@/data/featuredMovies";

function AppContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryMovies, setCategoryMovies] = useState<FeaturedMovie[] | null>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    status,
    statusLabel,
    recommendations,
    error,
    loading,
    apiKeys,
    history,
    favoriteIds,
    actorData,
    currentPage,
    totalPages,
    sendMessage,
    clearHistory,
    toggleFavorite,
    loadNextPage,
    loadPreviousPage,
    reset,
  } = useMovieAgent();

  const apiKeysMissing = !apiKeys.tmdb || !apiKeys.groq;

  useEffect(() => {
    if (recommendations.length > 0 && window.innerWidth < 1024) {
      setTimeout(() => {
        recommendationsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    }
  }, [recommendations.length]);

  function handleCategorySelect(category: any, movies: FeaturedMovie[]) {
    setSelectedCategory(category.id);
    setCategoryMovies(movies);
    reset();
  }

  function handleBackToHome() {
    setSelectedCategory(null);
    setCategoryMovies(null);
    reset();
  }

  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar 
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
        />

        <div className="flex-1 lg:ml-0 min-w-0">
          <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:pl-4 pl-14">
            <div className="mb-6">
              <HeroHeader
                onReset={handleBackToHome}
                hasResults={recommendations.length > 0}
              />
            </div>

            {apiKeysMissing && (
              <div className="mb-4 flex items-start gap-3 rounded-lg bg-ink p-4 text-body-sm">
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">API keys required</p>
                  <p className="text-white/70 mt-1">
                    Copy <code className="text-white/90">.env.example</code> to{" "}
                    <code className="text-white/90">.env</code> and add your{" "}
                    <a
                      href="https://www.themoviedb.org/settings/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white underline hover:no-underline"
                    >
                      TMDB
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://console.groq.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white underline hover:no-underline"
                    >
                      Groq
                    </a>{" "}
                    API keys, then restart the dev server.
                  </p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="mb-4 flex items-start gap-3 rounded-lg bg-error/10 p-4 text-body-sm hairline-inset-light">
                <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                <p className="text-error">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
              <div className="lg:col-span-2 lg:sticky lg:top-6 lg:self-start lg:h-[calc(100vh-6rem)] min-h-[500px] max-h-[70vh] lg:max-h-none">
                <ChatPanel
                  messages={messages}
                  loading={loading}
                  status={status}
                  statusLabel={statusLabel}
                  history={history}
                  onSend={sendMessage}
                  onHistorySelect={sendMessage}
                  onClearHistory={clearHistory}
                  apiKeysMissing={apiKeysMissing}
                />
              </div>

              <div className="lg:col-span-3 pb-8">
                {actorData ? (
                  <div className="space-y-6">
                    <div className="card-chrome-lg rounded-lg p-6">
                      <div className="flex items-start gap-6">
                        {actorData.person.profile_url && (
                          <img
                            src={actorData.person.profile_url}
                            alt={actorData.person.name}
                            className="w-32 h-48 rounded-lg object-cover shadow-level-4"
                          />
                        )}
                        <div className="flex-1">
                          <h2 className="text-display-sm font-semibold text-foreground mb-2">{actorData.person.name}</h2>
                          {actorData.person.birthday && (
                            <p className="text-body-sm text-ink-mute mb-4">
                              Born: {new Date(actorData.person.birthday).toLocaleDateString()}
                            </p>
                          )}
                          <p className="text-body-sm text-ink-body leading-relaxed mb-4">
                            {actorData.person.biography}
                          </p>
                          <div className="flex gap-4 text-body-sm">
                            <div>
                              <p className="font-semibold text-ink">{actorData.credits.movies.length}</p>
                              <p className="text-ink-mute">Films</p>
                            </div>
                            <div>
                              <p className="font-semibold text-ink">{actorData.credits.tvShows.length}</p>
                              <p className="text-ink-mute">TV Shows</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {actorData.credits.movies.length > 0 && (
                      <div>
                        <h3 className="text-display-sm font-semibold text-foreground mb-4">Films</h3>
                        <div className="space-y-3">
                          {actorData.credits.movies.map((movie) => (
                            <div key={movie.id} className="card-chrome rounded-lg p-4">
                              <p className="font-semibold text-foreground">{movie.title}</p>
                              <p className="text-body-sm text-ink-mute mt-1">{movie.why_watch}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {actorData.credits.tvShows.length > 0 && (
                      <div>
                        <h3 className="text-display-sm font-semibold text-foreground mb-4">TV Shows</h3>
                        <div className="space-y-3">
                          {actorData.credits.tvShows.map((show) => (
                            <div key={show.id} className="card-chrome rounded-lg p-4">
                              <p className="font-semibold text-foreground">{show.title}</p>
                              <p className="text-body-sm text-ink-mute mt-1">{show.why_watch}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : recommendations.length > 0 ? (
                  <div ref={recommendationsRef}>
                    <MovieGrid
                      recommendations={recommendations}
                      favoriteIds={favoriteIds}
                      onToggleFavorite={toggleFavorite}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onNextPage={loadNextPage}
                      onPreviousPage={loadPreviousPage}
                      loading={loading && recommendations.length === 0}
                    />
                  </div>
                ) : selectedCategory && categoryMovies ? (
                  <CategoryMovies 
                    movies={categoryMovies} 
                    categoryName={categoryMovies[0]?.title ? "" : selectedCategory}
                  />
                ) : (
                  <div className="space-y-8">
                    <FeaturedMovies />
                    
                    <div className="card-chrome-lg rounded-lg p-6 sm:p-8 text-center">
                      <h3 className="text-body-md font-semibold text-foreground mb-4">Hi! I'm CineMatch - your movie expert!<br />Ask me for recommendations</h3>
                      <div className="flex flex-wrap justify-center gap-3">
                        <span className="px-4 py-2 bg-card rounded-lg card-chrome text-body-sm text-ink-body">"Show me action movies"</span>
                        <span className="px-4 py-2 bg-card rounded-lg card-chrome text-body-sm text-ink-body">"Recommend sci-fi films"</span>
                        <span className="px-4 py-2 bg-card rounded-lg card-chrome text-body-sm text-ink-body">"Movies with 7.9 rating"</span>
                        <span className="px-4 py-2 bg-card rounded-lg card-chrome text-body-sm text-ink-body">"Best comedies"</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <footer className="mt-8 pt-6 border-t border-border text-center text-caption text-ink-mute">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;