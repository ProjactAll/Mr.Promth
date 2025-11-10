"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => Promise<void> | void;
  isStreaming: boolean;
}

export function ChatInput({ onSend, isStreaming }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim() || isStreaming) return;
    const text = value.trim();
    setValue("");
    await onSend(text);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        className="min-h-[120px] w-full resize-y rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        placeholder="Ask Mr.Prompt anything..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={isStreaming}
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Shift + Enter for newline</span>
        <Button type="submit" isLoading={isStreaming} disabled={!value.trim()}>
          Send
        </Button>
      </div>
    </form>
  );
}
