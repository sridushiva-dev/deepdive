"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Handle,
  Position,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { memo, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { NodeState } from "@prisma/client";

export interface ConstellationNodeData {
  label: string;
  state: NodeState | string;
  depth: number;
  summary?: string;
  [key: string]: unknown;
}

function ConstellationNodeComponent({
  data,
  selected,
}: {
  data: ConstellationNodeData;
  selected?: boolean;
}) {
  const state = data.state as string;
  const isSeed = state === "SEED";
  const isDeep = state === "DEEP";
  const isExploring = state === "EXPLORING";

  return (
    <div
      className={cn(
        "relative px-4 py-3 rounded-2xl border transition-all duration-500 min-w-[120px] max-w-[180px]",
        isSeed && "border-accent/50 bg-accent/10 glow-accent",
        isDeep && "border-accent-deep/50 bg-accent-deep/10 glow-deep",
        isExploring && "border-accent/40 bg-surface-elevated",
        !isSeed && !isDeep && !isExploring && "border-border bg-surface/80",
        selected && "ring-2 ring-accent/60 scale-105"
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-accent/50 !w-2 !h-2 !border-0" />
      <p className="text-xs font-medium text-foreground leading-tight truncate">{data.label}</p>
      {data.depth > 0 && (
        <p className="text-[10px] text-muted mt-1">depth {data.depth}</p>
      )}
      <Handle type="source" position={Position.Right} className="!bg-accent/50 !w-2 !h-2 !border-0" />
      {isDeep && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-deep animate-pulse" />
      )}
    </div>
  );
}

const nodeTypes = {
  constellation: memo(ConstellationNodeComponent),
};

interface ConstellationMapProps {
  nodes: Array<{
    id: string;
    label: string;
    state: NodeState | string;
    depth: number;
    summary?: string | null;
    positionX: number;
    positionY: number;
    parentId?: string | null;
  }>;
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  stats?: { nodeCount: number; depthMax: number; minutes: number };
  isDemo?: boolean;
}

function buildFlowElements(
  nodes: ConstellationMapProps["nodes"]
): { flowNodes: Node[]; flowEdges: Edge[] } {
  const flowNodes: Node[] = nodes.map((n) => ({
    id: n.id,
    type: "constellation",
    position: { x: n.positionX, y: n.positionY },
    data: {
      label: n.label,
      state: n.state,
      depth: n.depth,
      summary: n.summary,
    },
  }));

  const flowEdges: Edge[] = nodes
    .filter((n) => n.parentId)
    .map((n) => ({
      id: `${n.parentId}-${n.id}`,
      source: n.parentId!,
      target: n.id,
      animated: n.state === "EXPLORING",
      style: { stroke: "rgba(94, 158, 255, 0.4)" },
    }));

  return { flowNodes, flowEdges };
}

export function ConstellationMap({
  nodes,
  onNodeClick,
  selectedNodeId,
  stats,
  isDemo,
}: ConstellationMapProps) {
  const { flowNodes: initialNodes, flowEdges: initialEdges } = buildFlowElements(nodes);
  const [flowNodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { flowNodes: n, flowEdges: e } = buildFlowElements(nodes);
    setNodes(n);
    setEdges(e);
  }, [nodes, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl border border-border bg-surface/30 starfield overflow-hidden">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.03)" gap={24} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const state = (n.data as ConstellationNodeData).state;
            if (state === "DEEP") return "#c8a84a";
            if (state === "EXPLORING") return "#5e9eff";
            return "#2a2a35";
          }}
          maskColor="rgba(5, 5, 8, 0.8)"
          className="!bg-surface/90 !border-border"
        />
        {stats && (
          <Panel position="top-left" className="glass rounded-xl px-4 py-2 m-2">
            <div className="flex gap-4 text-xs text-muted">
              <span>{stats.nodeCount} concepts</span>
              <span>{stats.depthMax} levels deep</span>
              <span>{stats.minutes} min</span>
            </div>
          </Panel>
        )}
        {isDemo && (
          <Panel position="top-right" className="m-2">
            <span className="text-xs px-3 py-1 rounded-full bg-accent-deep/20 text-accent-deep border border-accent-deep/30">
              Demo dive
            </span>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

