"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { GRAPH_NODES, GRAPH_LINKS, type GraphNode } from "@/lib/mock-data";
import { riskLevel, riskMeta } from "@/lib/utils";

const typeColor: Record<GraphNode["type"], string> = {
  kingpin: "#EF4444",
  wallet: "#F59E0B",
  account: "#3B82F6",
  device: "#22D3EE",
  phone: "#8B5CF6",
};

export function FraudGraph({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (n: GraphNode) => void;
}) {
  // adjacency for highlight
  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    GRAPH_LINKS.forEach((l) => {
      if (!map.has(l.source)) map.set(l.source, new Set());
      if (!map.has(l.target)) map.set(l.target, new Set());
      map.get(l.source)!.add(l.target);
      map.get(l.target)!.add(l.source);
    });
    return map;
  }, []);

  const isDim = (id: string) =>
    activeId && id !== activeId && !neighbors.get(activeId)?.has(id);

  return (
    <svg viewBox="0 0 1000 600" className="h-full w-full">
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* links */}
      {GRAPH_LINKS.map((l, i) => {
        const s = GRAPH_NODES.find((n) => n.id === l.source)!;
        const t = GRAPH_NODES.find((n) => n.id === l.target)!;
        const connected = activeId && (l.source === activeId || l.target === activeId);
        const dim = activeId && !connected;
        return (
          <motion.line
            key={`${l.source}-${l.target}`}
            x1={s.x}
            y1={s.y}
            x2={t.x}
            y2={t.y}
            stroke={connected ? "rgba(96,165,250,0.8)" : "rgba(148,163,184,0.22)"}
            strokeWidth={connected ? 2 : 1 + l.weight}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: dim ? 0.12 : 1 }}
            transition={{ duration: 1, delay: i * 0.05 }}
          />
        );
      })}

      {/* animated pulses along active links */}
      {activeId &&
        GRAPH_LINKS.filter((l) => l.source === activeId || l.target === activeId).map((l) => {
          const s = GRAPH_NODES.find((n) => n.id === l.source)!;
          const t = GRAPH_NODES.find((n) => n.id === l.target)!;
          return (
            <motion.circle
              key={`pulse-${l.source}-${l.target}`}
              r={3}
              fill="#60A5FA"
              initial={{ cx: s.x, cy: s.y }}
              animate={{ cx: [s.x, t.x], cy: [s.y, t.y] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}

      {/* nodes */}
      {GRAPH_NODES.map((n, i) => {
        const r = 12 + n.risk / 7;
        const color = typeColor[n.type];
        const active = activeId === n.id;
        const dim = isDim(n.id);
        return (
          <motion.g
            key={n.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: dim ? 0.3 : 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 260, damping: 18 }}
            style={{ cursor: "pointer", transformOrigin: `${n.x}px ${n.y}px` }}
            onClick={() => onSelect(n)}
          >
            {/* kingpin pulse */}
            {n.type === "kingpin" && (
              <circle cx={n.x} cy={n.y} r={r} fill={color} opacity={0.3}>
                <animate attributeName="r" values={`${r};${r * 1.9};${r}`} dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
              </circle>
            )}
            {active && <circle cx={n.x} cy={n.y} r={r + 8} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6} />}
            <circle cx={n.x} cy={n.y} r={r} fill={color} style={{ filter: `drop-shadow(0 0 8px ${color}aa)` }} />
            <circle cx={n.x} cy={n.y} r={r * 0.45} fill="url(#nodeGlow)" />
            <text
              x={n.x}
              y={n.y + r + 15}
              textAnchor="middle"
              className="fill-ink-300 font-mono"
              style={{ fontSize: 12 }}
            >
              {n.label}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

export { typeColor };
