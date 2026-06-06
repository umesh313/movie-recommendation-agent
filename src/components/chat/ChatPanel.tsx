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
  "Dark sci-fi from the 2010s",
  "Feel-good comedy for a rainy day",
  "Mind-bending thriller like Inception",
  "Classic 90s action movies",
  "Spanish cinema",
  "Korean films",
  "French movies",
  "Bollywood",
  "Brad Pitt movies",
  "Tom Hanks filmography",
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
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative px-4 py-4 border-b border-white/10 bg-gradient-to-r from-cinema-gold/10 via-transparent to-cinema-amber/10">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-cinema-gold to-cinema-amber flex items-center justify-center shadow-lg shadow-cinema-gold/20">
            <Sparkles className="h-5 w-5 text-cinema-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm uppercase tracking-[0.24em] text-cinema-gold/90">
              CineMatch Agent
            </div>
            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  apiKeysMissing ? "bg-red-500" : "bg-green-500 animate-pulse"
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
              className="border-white/10 text-sm text-muted-foreground hover:border-cinema-gold/30"
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
              className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-background/90 p-3"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Recent queries
                </div>
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-cinema-gold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent queries yet.</p>
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
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground transition hover:bg-white/10"
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
              <div className="max-w-[90%] glass rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm whitespace-pre-wrap">
                {typedText}
                <span className="inline-block w-1.5 h-3.5 bg-cinema-gold/80 ml-0.5 animate-pulse" />
              </div>
            </div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-cinema-gold" />
                <span className="text-sm text-muted-foreground">
                  {statusLabel || getStatusText(status)}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading || apiKeysMissing}
              className="text-xs px-3 py-1.5 rounded-full glass hover:bg-white/10 transition-colors disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-3 border-t border-white/10 flex gap-2 bg-background/40"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            apiKeysMissing
              ? "Add API keys to .env first…"
              : "What kind of movie are you in the mood for?"
          }
          disabled={loading || apiKeysMissing}
          className="bg-background/60 border-white/10 focus-visible:ring-cinema-gold/50"
        />
        <Button
          type="submit"
          variant="cinema"
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
