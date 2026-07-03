"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { REGIONS, type Region } from "@/lib/mock-data";
import { riskLevel, riskMeta, cn } from "@/lib/utils";

/**
 * Stylized global threat-surveillance map.
 * Dot-matrix backdrop + glowing, pulsing region markers + signal arcs.
 */
export function WorldThreatMap({ className, compact = false }: { className?: string; compact?: boolean }) {
  const [active, setActive] = useState<Region | null>(null);

  // a few signal arcs from hotspots to a "command" node
  const hub = { x: 215, y: 235 }; // Austin-ish
  const arcs = REGIONS.slice(0, 5);

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl", className)}>
      <svg viewBox="0 0 1000 500" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="rgba(148,163,184,0.18)" />
          </pattern>
          <radialGradient id="mapFade" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="fadeMask">
            <rect width="1000" height="500" fill="url(#mapFade)" />
          </mask>
        </defs>

        {/* dot matrix */}
        <rect width="1000" height="500" fill="url(#dots)" mask="url(#fadeMask)" />

        {/* signal arcs */}
        {!compact &&
          arcs.map((r, i) => {
            const mx = (r.x + hub.x) / 2;
            const my = Math.min(r.y, hub.y) - 70;
            return (
              <motion.path
                key={`arc-${r.id}`}
                d={`M ${hub.x},${hub.y} Q ${mx},${my} ${r.x},${r.y}`}
                fill="none"
                stroke="rgba(34,211,238,0.35)"
                strokeWidth="1.2"
                strokeDasharray="3 5"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, delay: 0.2 + i * 0.15 }}
              />
            );
          })}

        {/* region markers */}
        {REGIONS.map((r) => {
          const meta = riskMeta[riskLevel(r.intensity * 100)];
          const radius = 4 + r.intensity * 7;
          return (
            <g
              key={r.id}
              onMouseEnter={() => setActive(r)}
              onMouseLeave={() => setActive(null)}
              className="cursor-pointer"
            >
              {/* pulse */}
              <circle cx={r.x} cy={r.y} r={radius} fill={meta.color} opacity={0.18}>
                <animate attributeName="r" values={`${radius};${radius * 2.4};${radius}`} dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.25;0;0.25" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={r.x} cy={r.y} r={radius * 0.55} fill={meta.color} style={{ filter: `drop-shadow(0 0 6px ${meta.color})` }} />
              <circle cx={r.x} cy={r.y} r={radius * 0.25} fill="white" opacity={0.9} />
            </g>
          );
        })}
      </svg>

      {/* tooltip */}
      {active && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-white/10 bg-ink-850/95 px-3 py-2 shadow-glass backdrop-blur-xl"
          style={{ left: `${(active.x / 1000) * 100}%`, top: `${(active.y / 500) * 100}%` }}
        >
          <div className="text-label font-semibold text-ink-50">
            {active.city}, {active.country}
          </div>
          <div className="text-micro text-ink-400">
            {active.cases.toLocaleString()} active cases · {Math.round(active.intensity * 100)} risk
          </div>
        </div>
      )}
    </div>
  );
}
