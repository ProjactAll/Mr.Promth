"use client";

import { useMemo, useState } from "react";

import { TerminalChatWrapper } from "@/components/terminal-chat-wrapper";
import type { ChatMessage } from "@/components/chat/types";

interface ChatPageProps {
  params: { session_id: string };
}

const SYSTEM_PROMPT: ChatMessage = {
  id: "system-message",
  role: "system",
  content: "You are Mr.Prompt, an expert AI prompt engineer assistant.",
  createdAt: new Date().toISOString(),
};

export default function ChatSessionPage({ params }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([SYSTEM_PROMPT]);
  const [isStreaming, setIsStreaming] = useState(false);

  const historyForProvider = useMemo(
    () =>
      messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    [messages]
  );

  const upsertMessage = (message: ChatMessage) => {
    setMessages((prev) => {
      const index = prev.findIndex((entry) => entry.id === message.id);
      if (index === -1) {
        return [...prev, message];
      }
      const clone = [...prev];
      clone[index] = { ...prev[index], ...message };
      return clone;
    });
  };

    const handleSend = async (content: string) => {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: params.session_id,
            stream: true,
            provider: "openai",
            messages: [...historyForProvider, { role: "user", content }],
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Failed to connect to AI gateway");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const segments = buffer.split("\n\n");
          buffer = segments.pop() ?? "";

          for (const segment of segments) {
            if (!segment.trim() || !segment.startsWith("data:")) continue;
            const payload = segment.replace(/^data:/, "").trim();
            if (!payload) continue;

            try {
              const parsed = JSON.parse(payload) as {
                type: string;
                content?: string;
                error?: string;
                name?: string;
                metadata?: Record<string, unknown>;
              };

              if (parsed.type === "tool" && parsed.content) {
                const toolMessage: ChatMessage = {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: `🛠️ ${parsed.name ?? "Tool"} Result\n${parsed.content}`,
                  createdAt: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, toolMessage]);
              }

              if (parsed.type === "chunk" && parsed.content) {
                upsertMessage({
                  ...assistantMessage,
                  content: (assistantMessage.content += parsed.content),
                });
              }

              if (parsed.type === "error") {
                upsertMessage({
                  ...assistantMessage,
                  content: parsed.error ?? "An error occurred",
                  isStreaming: false,
                });
              }

              if (parsed.type === "done") {
                upsertMessage({ ...assistantMessage, isStreaming: false });
              }
            } catch (parseError) {
              console.warn("Unable to parse stream payload", parseError);
            }
          }
        }

        upsertMessage({ ...assistantMessage, isStreaming: false });
      } catch (error) {
        upsertMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Gateway error: ${String(error)}`,
          createdAt: new Date().toISOString(),
        });
      } finally {
        setIsStreaming(false);
      }
    };

  return (
    <div className="flex h-full flex-col">
      <TerminalChatWrapper
        messages={messages.filter((message) => message.role !== "system")}
        onSend={handleSend}
        isStreaming={isStreaming}
        sessionId={params.session_id}
      />
    </div>
  );
}
