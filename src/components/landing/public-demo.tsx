"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ConstellationMap } from "@/components/constellation/constellation-map";
import {
  DEMO_JOURNEYS,
  flattenDemoTree,
  findDemoNode,
  getDemoResponsesForNode,
} from "@/lib/demo-content";
import { calculateNodePositions } from "@/lib/constellation-layout";
import { ArrowRight, BookOpen } from "lucide-react";

const DEMO = DEMO_JOURNEYS[0];
const flat = flattenDemoTree(DEMO.tree);
const layoutInputs = flat.map((f) => ({
  id: f.node.id,
  parentId: f.parentId,
  depth: f.depth,
}));
const positions = calculateNodePositions(layoutInputs, {
  horizontalGap: 280,
  verticalGap: 130,
});

type DemoNodeState = {
  id: string;
  label: string;
  state: string;
  depth: number;
  summary?: string;
  positionX: number;
  positionY: number;
  parentId: string | null;
};

function buildInitialNodes(): DemoNodeState[] {
  return flat.map((f) => {
    const pos = positions.get(f.node.id) ?? { x: 0, y: 0 };
    return {
      id: f.node.id,
      label: f.node.label,
      state: f.depth === 0 ? "SEED" : "DISCOVERED",
      depth: f.depth,
      summary: f.node.summary,
      positionX: pos.x,
      positionY: pos.y,
      parentId: f.parentId,
    };
  });
}

type ChatMsg = { id: string; role: "user" | "assistant"; content: string };

export function PublicDemoExperience() {
  const { data: session } = useSession();
  const [nodes, setNodes] = useState<DemoNodeState[]>(buildInitialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("root");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to your free preview of Deep Dive. Click any concept on the map to read and explore — no sign-up or payment needed. Try Stellar Collapse or Event Horizon.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedDemoNode = selectedNodeId
    ? findDemoNode(DEMO.tree, selectedNodeId)
    : null;
  const selectedUiNode = nodes.find((n) => n.id === selectedNodeId);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);

    const demoNode = findDemoNode(DEMO.tree, nodeId);
    if (!demoNode) return;

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          return { ...n, state: n.depth >= 2 ? "DEEP" : "EXPLORING" };
        }
        return n;
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `**${demoNode.label}** — ${demoNode.body}\n\nAsk a follow-up below to dive even deeper into this branch.`,
      },
    ]);
  }, []);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: userText },
    ]);
    setInput("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 500));

    const responseKey = selectedNodeId ?? "root";
    const responses = getDemoResponsesForNode(responseKey);
    const response = responses[Math.floor(Math.random() * responses.length)];

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "assistant", content: response },
    ]);
    setLoading(false);
  }

  return (
    <div className="space-y-10 lg:space-y-14">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 xl:gap-16 items-start">
        {/* Map — more breathing room */}
        <div className="min-h-[480px] lg:min-h-[560px]">
          <ConstellationMap
            nodes={nodes}
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNodeId}
            stats={{
              nodeCount: nodes.length,
              depthMax: Math.max(...nodes.map((n) => n.depth)),
              minutes: 12,
            }}
            isDemo
            relaxed
            hideMiniMap
          />
        </div>

        {/* Reading + chat column */}
        <div className="flex flex-col gap-6 lg:gap-8 min-h-[480px]">
          {selectedDemoNode && selectedUiNode && (
            <div className="glass rounded-2xl p-6 lg:p-8 border border-border space-y-4">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-accent uppercase tracking-wider mb-1">
                    Reading · depth {selectedUiNode.depth}
                  </p>
                  <h3 className="text-xl font-semibold">{selectedDemoNode.label}</h3>
                  <p className="text-sm text-muted mt-2 leading-relaxed">
                    {selectedDemoNode.summary}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 pl-8">
                {selectedDemoNode.body}
              </p>
              {selectedDemoNode.children && selectedDemoNode.children.length > 0 && (
                <div className="pl-8 pt-2">
                  <p className="text-xs text-muted mb-2">Branches to explore on the map:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDemoNode.children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => handleNodeClick(child.id)}
                        className="text-xs px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 hover:bg-accent/15 hover:border-accent/50 transition-colors"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col flex-1 rounded-2xl border border-border bg-surface/40 min-h-[280px]">
            <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-4 max-h-[320px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent text-background"
                        : "bg-surface-elevated border border-border"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content.replace(/\*\*(.*?)\*\*/g, "$1")}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <p className="text-sm text-muted animate-pulse pl-2">Diving deeper...</p>
              )}
            </div>
            <div className="p-5 lg:p-6 border-t border-border">
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask anything to dive deeper..."
                  className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm"
                />
                <Button size="icon" className="shrink-0" onClick={handleSend} disabled={loading || !input.trim()}>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted mt-3 text-center">
                Free preview — all concepts readable. Sign up only to save your own dives.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center glass rounded-2xl p-8 lg:p-10 border border-border/60 max-w-2xl mx-auto">
        <p className="text-muted mb-5 leading-relaxed">
          Loved the preview? Create a free account to save your constellation, connect your own AI key, and dive into any topic.
        </p>
        <Link href={session ? "/dashboard" : "/signup"}>
          <Button variant="outline">
            {session ? "Go to dashboard" : "Create free account"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
