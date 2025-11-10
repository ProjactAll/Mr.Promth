import { memo } from "react";
import { twMerge } from "tailwind-merge";

import type { ChatMessage } from "./types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = memo(({ message }: MessageBubbleProps) => {
  const isAssistant = message.role === "assistant" || message.role === "system";

  return (
    <div
      className={twMerge(
        "flex flex-col gap-2 rounded-lg border border-border/60 px-4 py-3 shadow-sm transition-colors",
        isAssistant ? "bg-muted/60" : "bg-accent/10 border-accent/40"
      )}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
        <span>{isAssistant ? "Mr.Prompt" : "You"}</span>
        <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
      </div>
      <div className="prose prose-invert max-w-none text-sm leading-6">
        {message.content || (message.isStreaming ? "…" : "")}
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";
