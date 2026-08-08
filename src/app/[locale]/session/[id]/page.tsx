"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { ConstellationMap } from "@/components/constellation/constellation-map";
import { LearningChat } from "@/components/learning/learning-chat";
import { ShareModal } from "@/components/share/share-modal";
import { Share2, MessageSquare, Map } from "lucide-react";
import type { NodeState } from "@prisma/client";

interface SessionData {
  id: string;
  title: string;
  rootTopic: string;
  isDemo: boolean;
  nodeCount: number;
  depthMax: number;
  totalMinutes: number;
  nodes: Array<{
    id: string;
    label: string;
    state: NodeState;
    depth: number;
    summary: string | null;
    positionX: number;
    positionY: number;
    parentId: string | null;
  }>;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    nodeId: string | null;
  }>;
}

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}`);
    const data = await res.json();
    if (res.ok) {
      setSession(data.session);
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const selectedNode = session?.nodes.find((n) => n.id === selectedNodeId);

  const chatMessages = session?.messages
    .filter((m) => !selectedNodeId || m.nodeId === selectedNodeId || m.nodeId === null)
    .map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    })) ?? [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Loading your dive...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Session not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen starfield">
      <Navbar />
      <main className="pt-20 px-4 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <h1 className="text-xl font-semibold">{session.title}</h1>
            <p className="text-sm text-muted">
              {session.nodeCount} concepts · {session.depthMax} levels deep
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
            >
              {showChat ? <Map className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </Button>
            <Button size="sm" onClick={() => setShowShare(true)}>
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-180px)]">
          <ConstellationMap
            nodes={session.nodes}
            onNodeClick={(id) => {
              setSelectedNodeId(id);
              setShowChat(true);
            }}
            selectedNodeId={selectedNodeId}
            stats={{
              nodeCount: session.nodeCount,
              depthMax: session.depthMax,
              minutes: session.totalMinutes,
            }}
            isDemo={session.isDemo}
          />

          {showChat && (
            <div className="flex flex-col gap-4">
              {selectedNode && (
                <div className="glass rounded-2xl p-4 border border-border">
                  <p className="text-xs text-accent mb-1">Selected concept</p>
                  <h3 className="font-semibold">{selectedNode.label}</h3>
                  {selectedNode.summary && (
                    <p className="text-sm text-muted mt-2">{selectedNode.summary}</p>
                  )}
                </div>
              )}
              <LearningChat
                sessionId={sessionId}
                nodeId={selectedNodeId}
                nodeLabel={selectedNode?.label}
                initialMessages={chatMessages}
                isDemo={session.isDemo}
                onNewConcepts={() => loadSession()}
              />
            </div>
          )}
        </div>
      </main>

      {showShare && (
        <ShareModal
          sessionId={sessionId}
          sessionTitle={session.title}
          stats={{
            nodeCount: session.nodeCount,
            depthMax: session.depthMax,
            minutes: session.totalMinutes,
          }}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
