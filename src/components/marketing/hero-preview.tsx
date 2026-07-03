"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck, TrendingUp, Cpu } from "lucide-react";
import { Counter } from "@/components/motion/counter";
import { Badge } from "@/components/ui/badge";
import { TREND_24H, THREAT_FEED } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Build a smooth SVG area path from a numeric series. */
function areaPath(values: number[], w: number, h: number) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, h - ((v - min) / span) * h] as const);
  const d = pts
    .map((p, i) => {
      if (i === 0) return `M ${p[0]},${p[1]}`;
      const prev = pts[i - 1];
      const cx = (prev[0] + p[0]) / 2;
      return `C ${cx},${prev[1]} ${cx},${p[1]} ${p[0]},${p[1]}`;
    })
    .join(" ");
  return { line: d, fill: `${d} L ${w},${h} L 0,${h} Z` };
}

const miniMetrics = [
  { label: "Blocked", to: 48213, icon: ShieldCheck, tone: "text-primary-300" },
  { label: "Saved", to: 18.4, prefix: "$", suffix: "M", decimals: 1, icon: TrendingUp, tone: "text-success-400" },
  { label: "AI / sec", to: 2840, icon: Cpu, tone: "text-accent-300" },
  { label: "Risk idx", to: 63, icon: Activity, tone: "text-warning-400" },
];

export function HeroPreview() {
  const series = TREND_24H.map((d) => d.threats);
  const { line, fill } = areaPath(series, 560, 150);

  return (
    <div className="perspective relative mx-auto w-full max-w-5xl">
      {/* glow behind */}
      <div className="absolute inset-x-10 -top-6 bottom-0 -z-10 rounded-[2.5rem] bg-primary-500/20 blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 12 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong glass-highlight overflow-hidden rounded-2xl sm:rounded-3xl"
      >
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-danger-500/70" />
          <span className="h-3 w-3 rounded-full bg-warning-500/70" />
          <span className="h-3 w-3 rounded-full bg-success-500/70" />
          <div className="ml-3 flex-1">
            <div className="mx-auto w-fit rounded-md border border-white/10 bg-white/[0.04] px-3 py-1 text-micro text-ink-400">
              app.fraudshield.ai/command-center
            </div>
          </div>
          <Badge tone="success" dot pulse>
            Live
          </Badge>
        </div>

        {/* body */}
        <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
          {/* left: metrics + chart */}
          <div className="space-y-4 sm:col-span-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {miniMetrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <m.icon className={cn("h-4 w-4", m.tone)} />
                  <div className="mt-2 tabular text-h4 font-semibold text-ink-50">
                    <Counter
                      to={m.to}
                      prefix={m.prefix}
                      suffix={m.suffix}
                      decimals={m.decimals ?? 0}
                    />
                  </div>
                  <div className="text-micro text-ink-500">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-label text-ink-300">Threat volume · 24h</span>
                <Badge tone="primary">+12.4%</Badge>
              </div>
              <svg viewBox="0 0 560 150" className="h-28 w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={fill} fill="url(#heroFill)" />
                <motion.path
                  d={line}
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.6, delay: 0.8, ease: "easeInOut" }}
                />
              </svg>
            </div>
          </div>

          {/* right: live threat feed */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-label text-ink-300">Live threats</span>
              <Activity className="h-3.5 w-3.5 text-accent-400" />
            </div>
            <div className="space-y-1.5">
              {THREAT_FEED.slice(0, 5).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.12 }}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.03]"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      t.severity === "critical" && "bg-danger-500",
                      t.severity === "high" && "bg-warning-500",
                      t.severity === "medium" && "bg-accent-400",
                      t.severity === "low" && "bg-success-500"
                    )}
                  />
                  <span className="flex-1 truncate text-micro text-ink-300">{t.type}</span>
                  <span className="tabular text-micro text-ink-500">{t.score}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* floating accent cards */}
      <FloatingCard
        className="-left-4 top-24 hidden sm:flex md:-left-12"
        delay={0.9}
        tone="danger"
        title="Critical threat blocked"
        value="CEO voice-clone · 0.4s"
      />
      <FloatingCard
        className="-right-4 top-40 hidden sm:flex md:-right-12"
        delay={1.1}
        tone="success"
        title="AI confidence"
        value="99.2% accuracy"
      />
    </div>
  );
}

function FloatingCard({
  className,
  title,
  value,
  tone,
  delay,
}: {
  className?: string;
  title: string;
  value: string;
  tone: "danger" | "success";
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 18 }}
      className={cn("absolute z-10 animate-float", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="glass-strong flex items-center gap-3 rounded-2xl px-4 py-3 shadow-glass-lg">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            tone === "danger" ? "bg-danger-500/15 text-danger-400" : "bg-success-500/15 text-success-400"
          )}
        >
          {tone === "danger" ? <ShieldCheck className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
        </span>
        <div>
          <div className="text-micro text-ink-400">{title}</div>
          <div className="text-label font-semibold text-ink-50">{value}</div>
        </div>
      </div>
    </motion.div>
  );
}
