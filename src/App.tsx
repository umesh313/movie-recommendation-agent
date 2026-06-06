import { AlertCircle } from "lucide-react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { HeroHeader } from "@/components/layout/HeroHeader";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { useMovieAgent } from "@/hooks/useMovieAgent";

function App() {
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

  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <HeroHeader
          onReset={reset}
          hasResults={recommendations.length > 0}
        />

        {apiKeysMissing && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-200">API keys required</p>
              <p className="text-muted-foreground mt-1">
                Copy <code className="text-cinema-gold">.env.example</code> to{" "}
                <code className="text-cinema-gold">.env</code> and add your{" "}
                <a
                  href="https://www.themoviedb.org/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cinema-gold hover:underline"
                >
                  TMDB
                </a>{" "}
                and{" "}
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cinema-gold hover:underline"
                >
                  Groq
                </a>{" "}
                API keys, then restart the dev server.
              </p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-2 lg:sticky lg:top-6 lg:self-start h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] min-h-[480px]">
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
                <div className="glass rounded-3xl p-6 border border-white/5">
                  <div className="flex items-start gap-6">
                    {actorData.person.profile_url && (
                      <img
                        src={actorData.person.profile_url}
                        alt={actorData.person.name}
                        className="w-32 h-48 rounded-2xl object-cover shadow-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-2">{actorData.person.name}</h2>
                      {actorData.person.birthday && (
                        <p className="text-sm text-muted-foreground mb-4">
                          Born: {new Date(actorData.person.birthday).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-foreground/80 leading-relaxed mb-4">
                        {actorData.person.biography}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-cinema-gold">{actorData.credits.movies.length}</p>
                          <p className="text-muted-foreground">Films</p>
                        </div>
                        <div>
                          <p className="font-semibold text-cinema-gold">{actorData.credits.tvShows.length}</p>
                          <p className="text-muted-foreground">TV Shows</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {actorData.credits.movies.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Films</h3>
                    <div className="space-y-3">
                      {actorData.credits.movies.map((movie) => (
                        <div key={movie.id} className="glass rounded-xl p-3 border border-white/5">
                          <p className="font-semibold">{movie.title}</p>
                          <p className="text-sm text-muted-foreground">{movie.why_watch}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {actorData.credits.tvShows.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">TV Shows</h3>
                    <div className="space-y-3">
                      {actorData.credits.tvShows.map((show) => (
                        <div key={show.id} className="glass rounded-xl p-3 border border-white/5">
                          <p className="font-semibold">{show.title}</p>
                          <p className="text-sm text-muted-foreground">{show.why_watch}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
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
            )}
          </div>
        </div>

        <footer className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-muted-foreground">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </footer>
      </div>
    </div>
  );
}

export default App;
