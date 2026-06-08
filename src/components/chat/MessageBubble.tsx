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
          "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-body-sm leading-relaxed whitespace-pre-wrap break-words",
          isUser
            ? "bg-ink text-white rounded-tr-sm"
            : "bg-card text-foreground card-chrome rounded-tl-sm"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}