"use client";

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Sparkline } from "./sparkline";
import { type MetricCardData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const toneMap = {
  primary: { text: "text-primary-300", bg: "bg-primary-500/12", ring: "ring-primary-400/20", spark: "#60A5FA" },
  accent: { text: "text-accent-300", bg: "bg-accent-500/12", ring: "ring-accent-400/20", spark: "#22D3EE" },
  success: { text: "text-success-400", bg: "bg-success-500/12", ring: "ring-success-400/20", spark: "#34D399" },
  danger: { text: "text-danger-400", bg: "bg-danger-500/12", ring: "ring-danger-400/20", spark: "#F87171" },
  warning: { text: "text-warning-400", bg: "bg-warning-500/12", ring: "ring-warning-400/20", spark: "#FBBF24" },
};

export function MetricCard({ data, icon: Icon }: { data: MetricCardData; icon: LucideIcon }) {
  const t = toneMap[data.tone];
  const up = data.delta >= 0;
  return (
    <GlassCard interactive className="group overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl ring-1", t.bg, t.ring, t.text)}>
          <Icon className="h-5 w-5" />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro font-semibold",
            up ? "bg-success-500/12 text-success-400" : "bg-danger-500/12 text-danger-400"
          )}
        >
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(data.delta)}%
        </span>
      </div>

      <div className="mt-4">
        <div className="tabular text-display-sm font-bold text-ink-50">{data.display}</div>
        <div className="mt-0.5 text-label text-ink-400">{data.label}</div>
      </div>

      <div className="mt-3 -mb-1 opacity-80 transition-opacity group-hover:opacity-100">
        <Sparkline data={data.spark} color={t.spark} width={260} height={44} className="w-full" />
      </div>
    </GlassCard>
  );
}
