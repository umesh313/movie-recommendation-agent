import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, Sparkles, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { cn } from "@/lib/utils";
import type { AgentStatus, ChatMessage } from "@/types/movie";

const SUGGESTIONS = [
  "Recommend a gripping thriller",
  "Show me the best comedies",
  "Popular sci-fi movies",
  "Best Bollywood films",
  "Korean cinema recommendations",
];

interface ChatPanelProps {
  messages: ChatMessage[];
  history: string[];
  loading: boolean;
  status: AgentStatus;
  statusLabel: string;
  onSend: (text: string) => void;
  onHistorySelect: (text: string) => void;
  onClearHistory: () => void;
  apiKeysMissing: boolean;
}

export function ChatPanel({
  messages,
  history,
  loading,
  status,
  statusLabel,
  onSend,
  onHistorySelect,
  onClearHistory,
  apiKeysMissing,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [typedText, setTypedText] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAssistantRef = useRef<string>("");

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typedText, loading, statusLabel]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (
      last?.role === "assistant" &&
      last.content !== lastAssistantRef.current &&
      messages.length > 1 &&
      !loading
    ) {
      lastAssistantRef.current = last.content;
      typeOut(last.content);
    }
  }, [messages, loading]);

  const typeOut = async (full: string) => {
    setTypedText("");
    for (let i = 0; i <= full.length; i++) {
      setTypedText(full.slice(0, i));
      await new Promise((r) => setTimeout(r, 10));
    }
    setTypedText("");
  };

  const send = (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    onSend(q);
  };

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <div className="flex flex-col h-full bg-background rounded-lg card-chrome overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-ink flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-body-sm-strong text-foreground">
              CineMatch Agent
            </div>
            <div className="text-caption text-ink-mute flex items-center gap-2 mt-0.5">
              <span
                className={cn(
                  "inline-block h-1.5 w-1.5 rounded-full",
                  apiKeysMissing ? "bg-error" : "bg-success animate-pulse"
                )}
              />
              {apiKeysMissing ? "API keys missing" : "Online · Movie expert"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen((open) => !open)}
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {historyOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden rounded-lg bg-card p-3"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="text-caption text-ink-mute">
                  Recent queries
                </div>
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="inline-flex items-center gap-1 text-caption text-ink-mute hover:text-ink transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
              {history.length === 0 ? (
                <p className="text-body-sm text-ink-mute">No recent queries yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {history.map((query) => (
                    <button
                      key={query}
                      type="button"
                      onClick={() => {
                        onHistorySelect(query);
                        setHistoryOpen(false);
                      }}
                      className="rounded-md bg-canvas-soft px-3 py-1.5 text-body-sm text-ink-body transition hover:bg-canvas-soft-2 hover:text-ink"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div ref={scrollRef} className="p-4 space-y-3 max-h-[calc(100vh-320px)] lg:max-h-[520px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => {
              const isLastAssistant =
                m.role === "assistant" &&
                i === messages.length - 1 &&
                typedText &&
                !loading;
              if (isLastAssistant) return null;
              return (
                <motion.div
                  key={`${i}-${m.content.slice(0, 20)}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <MessageBubble message={m} />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {typedText && (
            <div className="flex justify-start">
              <div className="max-w-[90%] bg-card text-foreground card-chrome rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-body-sm whitespace-pre-wrap">
                {typedText}
                <span className="inline-block w-1.5 h-3.5 bg-ink ml-0.5 animate-pulse" />
              </div>
            </div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-card text-foreground card-chrome rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-ink" />
                <span className="text-body-sm text-ink-mute">
                  {statusLabel || getStatusText(status)}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="px-3 pb-2 flex flex-col gap-1.5">
          <p className="text-caption text-ink-mute">
            Thriller, comedy, romance, sci-fi, Bollywood, Korean cinema—I've got recommendations.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading || apiKeysMissing}
                className="text-caption px-3 py-1.5 rounded-full bg-card text-ink-body card-chrome hover:bg-canvas-soft transition-colors disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-3 border-t border-border flex gap-2 bg-card"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            apiKeysMissing
              ? "Add API keys to .env first…"
              : "🍿 What are you in the mood for today?"
          }
          disabled={loading || apiKeysMissing}
          className="bg-background border-border focus-visible:ring-ring"
        />
        <Button
          type="submit"
          variant="default"
          size="icon"
          disabled={loading || !input.trim() || apiKeysMissing}
          className="shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

function getStatusText(status: AgentStatus): string {
  switch (status) {
    case "extracting":
      return "Understanding your taste…";
    case "searching":
      return "Searching TMDB…";
    case "recommending":
      return "Curating your picks…";
    case "enriching":
      return "Loading posters & trailers…";
    default:
      return "Thinking…";
  }
}