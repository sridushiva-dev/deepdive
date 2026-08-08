"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface LearningChatProps {
  sessionId: string;
  nodeId?: string | null;
  nodeLabel?: string;
  initialMessages?: Message[];
  isDemo?: boolean;
  onNewConcepts?: (concepts: Array<{ label: string; summary: string }>) => void;
}

export function LearningChat({
  sessionId,
  nodeId,
  nodeLabel,
  initialMessages = [],
  isDemo,
  onNewConcepts,
}: LearningChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          nodeId,
          nodeLabel,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to get response");

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.newConcepts?.length) {
        onNewConcepts?.(data.newConcepts);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[300px] rounded-2xl border border-border bg-surface/50">
      {nodeLabel && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs text-muted">Diving into</p>
          <p className="text-sm font-medium">{nodeLabel}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
        {messages.length === 0 && (
          <p className="text-sm text-muted text-center py-8">
            Ask anything to dive deeper into this topic...
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-accent text-background"
                  : "bg-surface-elevated text-foreground border border-border"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-elevated rounded-2xl px-4 py-3 border border-border">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Dive deeper..."
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={loading}
          />
          <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {isDemo && (
          <p className="text-[10px] text-muted mt-2 text-center">
            Demo mode — connect your API key for real AI responses
          </p>
        )}
      </div>
    </div>
  );
}
