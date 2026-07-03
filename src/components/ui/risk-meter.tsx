"use client";

import { motion } from "framer-motion";
import { riskLevel, riskMeta, cn } from "@/lib/utils";

/** Circular animated risk gauge (0–100) with semantic coloring. */
export function RiskMeter({
  score,
  size = 168,
  stroke = 12,
  label = "Risk score",
  className,
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, score));
  const level = riskLevel(v);
  const meta = riskMeta[level];
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = c * 0.28; // leave a 28% gap at the bottom for a "speedometer" feel
  const arc = c - gap;
  const offset = arc * (1 - v / 100);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[126deg]">
        <defs>
          <linearGradient id={`rg-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={meta.color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={meta.color} />
          </linearGradient>
        </defs>
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${c}`}
        />
        {/* value */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#rg-${level})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${c}`}
          initial={{ strokeDashoffset: arc }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 10px ${meta.color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-display-sm font-bold" style={{ color: meta.color }}>
          {Math.round(v)}
        </span>
        <span className="text-micro uppercase tracking-widest" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <span className="mt-0.5 text-micro text-ink-500">{label}</span>
      </div>
    </div>
  );
}
