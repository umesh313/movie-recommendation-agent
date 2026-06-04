import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/movie";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
          isUser
            ? "bg-gradient-to-br from-cinema-gold to-cinema-amber text-cinema-navy font-medium rounded-br-sm"
            : "glass rounded-bl-sm text-foreground/90"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
