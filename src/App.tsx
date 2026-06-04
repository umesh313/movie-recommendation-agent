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
    sendMessage,
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
              onSend={sendMessage}
              apiKeysMissing={apiKeysMissing}
            />
          </div>

          <div className="lg:col-span-3 pb-8">
            <MovieGrid
              recommendations={recommendations}
              loading={loading && recommendations.length === 0}
            />
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
