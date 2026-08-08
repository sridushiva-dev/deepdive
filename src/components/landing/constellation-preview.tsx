"use client";

import { motion } from "framer-motion";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  state: "seed" | "exploring" | "deep" | "discovered";
  delay: number;
}

const NODES: Node[] = [
  { id: "root", x: 80, y: 140, label: "Black Holes", state: "seed", delay: 0 },
  { id: "collapse", x: 220, y: 80, label: "Stellar Collapse", state: "exploring", delay: 0.2 },
  { id: "horizon", x: 220, y: 200, label: "Event Horizon", state: "deep", delay: 0.35 },
  { id: "supernova", x: 360, y: 50, label: "Supernova", state: "discovered", delay: 0.5 },
  { id: "neutron", x: 360, y: 120, label: "Neutron Stars", state: "discovered", delay: 0.6 },
  { id: "schwarz", x: 360, y: 230, label: "Schwarzschild", state: "discovered", delay: 0.7 },
];

const EDGES: Array<[string, string]> = [
  ["root", "collapse"],
  ["root", "horizon"],
  ["collapse", "supernova"],
  ["collapse", "neutron"],
  ["horizon", "schwarz"],
];

function nodeCenter(id: string) {
  const n = NODES.find((node) => node.id === id)!;
  return { x: n.x, y: n.y };
}

function nodeStyle(state: Node["state"]) {
  switch (state) {
    case "seed":
      return { fill: "rgba(94, 158, 255, 0.25)", stroke: "rgba(94, 158, 255, 0.8)", r: 22 };
    case "exploring":
      return { fill: "rgba(94, 158, 255, 0.15)", stroke: "rgba(94, 158, 255, 0.6)", r: 16 };
    case "deep":
      return { fill: "rgba(200, 168, 74, 0.2)", stroke: "rgba(200, 168, 74, 0.8)", r: 16 };
    default:
      return { fill: "rgba(255, 255, 255, 0.04)", stroke: "rgba(255, 255, 255, 0.2)", r: 14 };
  }
}

export function LandingConstellationPreview() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <svg
        viewBox="0 0 440 280"
        className="w-full h-auto"
        aria-label="Constellation map preview showing connected learning concepts"
      >
        <defs>
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {EDGES.map(([from, to], i) => {
          const a = nodeCenter(from);
          const b = nodeCenter(to);
          return (
            <motion.line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(94, 158, 255, 0.35)"
              strokeWidth="1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
            />
          );
        })}

        {NODES.map((node) => {
          const style = nodeStyle(node.state);
          return (
            <g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={style.r}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth="1.5"
                filter={node.state === "seed" ? "url(#glow-blue)" : node.state === "deep" ? "url(#glow-gold)" : undefined}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: node.delay, type: "spring" }}
              />
              <motion.text
                x={node.x}
                y={node.y + style.r + 14}
                textAnchor="middle"
                fill="rgba(245, 245, 247, 0.7)"
                fontSize="10"
                fontFamily="system-ui, sans-serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: node.delay + 0.3 }}
              >
                {node.label}
              </motion.text>
            </g>
          );
        })}
      </svg>

      <div className="flex justify-center gap-6 mt-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent" /> Exploring
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-deep" /> Deep
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-foreground/30" /> Discovered
        </span>
      </div>
    </div>
  );
}
