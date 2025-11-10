"use client";

import { useEffect, useRef } from "react";

import type { ChatMessage } from "./types";
import { MessageBubble } from "./message-bubble";

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 space-y-4 overflow-y-auto pr-2">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-border/50 p-12 text-center text-sm text-muted-foreground">
          <p>No messages yet. Start the conversation by sending a prompt.</p>
        </div>
      ) : (
        messages.map((message) => <MessageBubble key={message.id} message={message} />)
      )}
    </div>
  );
}
