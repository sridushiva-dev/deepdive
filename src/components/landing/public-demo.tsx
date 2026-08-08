"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LandingConstellationPreview } from "@/components/landing/constellation-preview";
import { ConstellationMap } from "@/components/constellation/constellation-map";
import { DEMO_JOURNEYS, flattenDemoTree } from "@/lib/demo-content";
import { calculateNodePositions } from "@/lib/constellation-layout";
import { ArrowRight, Map, MessageSquare } from "lucide-react";

const DEMO = DEMO_JOURNEYS[0];
const flat = flattenDemoTree(DEMO.tree);
const layoutInputs = flat.map((f) => ({
  id: f.node.id,
  parentId: f.parentId,
  depth: f.depth,
}));
const positions = calculateNodePositions(layoutInputs);

const demoNodes = flat.map((f) => {
  const pos = positions.get(f.node.id) ?? { x: 0, y: 0 };
  const state =
    f.depth === 0 ? "SEED" : f.node.id === "stellar-collapse" ? "EXPLORING" : f.depth >= 2 ? "DEEP" : "DISCOVERED";
  return {
    id: f.node.id,
    label: f.node.label,
    state,
    depth: f.depth,
    summary: f.node.summary,
    positionX: pos.x,
    positionY: pos.y,
    parentId: f.parentId,
  };
});

const cannedMessages = [
  {
    id: "1",
    role: "assistant" as const,
    content:
      "Welcome to your demo dive into Black Holes. Each question opens new branches in your constellation. Try asking: 'What happens during stellar collapse?'",
  },
];

export function PublicDemoExperience() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);

  const selectedNode = demoNodes.find((n) => n.id === selectedNodeId);

  function handleTryDemo() {
    if (session) {
      router.push("/onboarding");
    } else {
      router.push("/signup?demo=1");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" size="sm" onClick={() => setShowMap(!showMap)}>
          {showMap ? <MessageSquare className="w-4 h-4" /> : <Map className="w-4 h-4" />}
          {showMap ? "Show chat" : "Show map"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 min-h-[420px]">
        {showMap ? (
          <ConstellationMap
            nodes={demoNodes}
            onNodeClick={setSelectedNodeId}
            selectedNodeId={selectedNodeId}
            stats={{ nodeCount: demoNodes.length, depthMax: 3, minutes: 12 }}
            isDemo
          />
        ) : (
          <div className="glass rounded-2xl border border-border p-6 flex flex-col justify-center">
            <LandingConstellationPreview />
          </div>
        )}

        <div className="space-y-4">
          {selectedNode && (
            <div className="glass rounded-2xl p-4 border border-border">
              <p className="text-xs text-accent mb-1">Selected concept</p>
              <h3 className="font-semibold">{selectedNode.label}</h3>
              {selectedNode.summary && (
                <p className="text-sm text-muted mt-2">{selectedNode.summary}</p>
              )}
            </div>
          )}
          <PublicDemoChat selectedNodeId={selectedNodeId} nodeLabel={selectedNode?.label} />
        </div>
      </div>

      <div className="text-center glass rounded-2xl p-6 border border-accent/20">
        <p className="text-muted mb-4">
          This is a live preview — no API key needed. Sign up to save your constellation and dive with real AI.
        </p>
        <Button onClick={handleTryDemo}>
          {session ? "Continue to onboarding" : "Start your own dive — free"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function PublicDemoChat({
  nodeLabel,
}: {
  selectedNodeId: string | null;
  nodeLabel?: string;
}) {
  type ChatMsg = { id: string; role: "user" | "assistant"; content: string };
  const [messages, setMessages] = useState<ChatMsg[]>(cannedMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg = { id: crypto.randomUUID(), role: "user" as const, content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const responses = DEMO.cannedResponses.default;
    const response = responses[Math.floor(Math.random() * responses.length)];
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "assistant" as const, content: response },
    ]);
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full min-h-[300px] rounded-2xl border border-border bg-surface/50">
      {nodeLabel && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs text-muted">Diving into</p>
          <p className="text-sm font-medium">{nodeLabel}</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[280px]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-accent text-background"
                  : "bg-surface-elevated border border-border"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-sm text-muted animate-pulse">Diving deeper...</div>
        )}
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything to dive deeper..."
            className="flex h-10 w-full rounded-xl border border-border bg-surface px-4 text-sm"
          />
          <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted mt-2 text-center">Demo responses — connect your key for real AI</p>
      </div>
    </div>
  );
}
