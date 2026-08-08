"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { ConstellationMap } from "@/components/constellation/constellation-map";
import { calculateNodePositions } from "@/lib/constellation-layout";
import { ArrowRight, BookOpen } from "lucide-react";

interface TreeNode {
  id: string;
  label: string;
  summary?: string;
  body?: string;
  children?: TreeNode[];
}

function flattenTree(
  node: TreeNode,
  parentId: string | null = null,
  depth = 0
): Array<{ node: TreeNode; parentId: string | null; depth: number }> {
  const result = [{ node, parentId, depth }];
  if (node.children) {
    for (const child of node.children) {
      result.push(...flattenTree(child, node.id, depth + 1));
    }
  }
  return result;
}

export default function CuratedPreviewPage() {
  const params = useParams();
  const mapId = params.id as string;
  const { data: session } = useSession();
  const router = useRouter();

  const [map, setMap] = useState<{
    title: string;
    description: string;
    estimatedMinutes: number;
    tree: TreeNode;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<string>("root");
  const [exploredIds, setExploredIds] = useState<Set<string>>(new Set(["root"]));

  useEffect(() => {
    fetch("/api/curated")
      .then((r) => r.json())
      .then((d) => {
        const found = d.maps?.find((m: { id: string }) => m.id === mapId);
        if (found) {
          const tree = JSON.parse(found.treeJson) as TreeNode;
          setMap({
            title: found.title,
            description: found.description,
            estimatedMinutes: found.estimatedMinutes,
            tree,
          });
        }
      });
  }, [mapId]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedId(nodeId);
    setExploredIds((prev) => new Set(prev).add(nodeId));
  }, []);

  if (!map) {
    return (
      <div className="min-h-screen flex items-center justify-center starfield">
        <p className="text-muted">Loading map...</p>
      </div>
    );
  }

  const flat = flattenTree(map.tree);
  const layoutInputs = flat.map((f) => ({
    id: f.node.id,
    parentId: f.parentId,
    depth: f.depth,
  }));
  const positions = calculateNodePositions(layoutInputs, {
    horizontalGap: 280,
    verticalGap: 130,
  });

  const nodes = flat.map((f) => {
    const pos = positions.get(f.node.id) ?? { x: 0, y: 0 };
    const explored = exploredIds.has(f.node.id);
    return {
      id: f.node.id,
      label: f.node.label,
      state: f.depth === 0 ? "SEED" : explored ? (f.depth >= 2 ? "DEEP" : "EXPLORING") : "DISCOVERED",
      depth: f.depth,
      summary: f.node.summary,
      positionX: pos.x,
      positionY: pos.y,
      parentId: f.parentId,
    };
  });

  const selectedNode = flat.find((f) => f.node.id === selectedId)?.node;

  function startDive() {
    if (!session) {
      router.push(`/signup?callbackUrl=/explore/${mapId}`);
      return;
    }
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ curatedMapId: mapId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.sessionId) router.push(`/session/${d.sessionId}`);
      });
  }

  return (
    <div className="min-h-screen starfield">
      <Navbar />
      <main className="pt-28 lg:pt-32 px-6 lg:px-10 pb-24 max-w-7xl mx-auto">
        <div className="mb-10 lg:mb-14">
          <Link href="/explore" className="text-sm text-muted hover:text-accent mb-4 inline-block">
            ← Back to explore
          </Link>
          <h1 className="text-3xl font-bold mb-2">{map.title}</h1>
          <p className="text-muted max-w-2xl">{map.description}</p>
          <p className="text-sm text-accent mt-2">
            Free to read all concepts below · {map.estimatedMinutes} min dive
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 xl:gap-16">
          <div className="min-h-[480px] lg:min-h-[520px]">
            <ConstellationMap
              nodes={nodes}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedId}
              stats={{
                nodeCount: nodes.length,
                depthMax: Math.max(...nodes.map((n) => n.depth)),
                minutes: map.estimatedMinutes,
              }}
              relaxed
              hideMiniMap
            />
          </div>

          <div className="space-y-6">
            {selectedNode && (
              <div className="glass rounded-2xl p-6 lg:p-8 border border-border space-y-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-accent uppercase tracking-wider mb-1">Concept</p>
                    <h2 className="text-xl font-semibold">{selectedNode.label}</h2>
                    {selectedNode.summary && (
                      <p className="text-sm text-muted mt-2">{selectedNode.summary}</p>
                    )}
                  </div>
                </div>
                {selectedNode.body && (
                  <p className="text-sm leading-relaxed text-foreground/90 pl-8">
                    {selectedNode.body}
                  </p>
                )}
                {selectedNode.children && selectedNode.children.length > 0 && (
                  <div className="pl-8 flex flex-wrap gap-2">
                    {selectedNode.children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => handleNodeClick(child.id)}
                        className="text-xs px-3 py-1.5 rounded-full border border-accent/30 hover:bg-accent/10 transition-colors"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="glass rounded-2xl p-6 border border-border text-center">
              <p className="text-sm text-muted mb-4">
                Want AI chat on this map? Sign up free and fork it into your own dive.
              </p>
              <Button onClick={startDive}>
                {session ? "Fork and dive with AI" : "Sign up free to dive with AI"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
