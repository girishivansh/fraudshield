"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { AI_INSIGHTS, type AIInsight } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const tone: Record<AIInsight["tone"], { border: string; chip: string; bar: string }> = {
  danger: { border: "border-danger-400/20", chip: "bg-danger-500/12 text-danger-400", bar: "bg-danger-500" },
  warning: { border: "border-warning-400/20", chip: "bg-warning-500/12 text-warning-400", bar: "bg-warning-500" },
  accent: { border: "border-accent-400/20", chip: "bg-accent-500/12 text-accent-300", bar: "bg-accent-400" },
  success: { border: "border-success-400/20", chip: "bg-success-500/12 text-success-400", bar: "bg-success-500" },
};

export function AIInsights() {
  return (
    <div className="space-y-3">
      {AI_INSIGHTS.map((insight, i) => {
        const t = tone[insight.tone];
        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn("group rounded-2xl border bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]", t.border)}
          >
            <div className="flex items-center justify-between">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-micro font-medium", t.chip)}>
                <Sparkles className="h-3 w-3" />
                {insight.tag}
              </span>
              <span className="tabular text-micro text-ink-500">{Math.round(insight.confidence * 100)}% conf.</span>
            </div>
            <h4 className="mt-2 text-body-sm font-semibold text-ink-100">{insight.title}</h4>
            <p className="mt-1 text-micro leading-relaxed text-ink-400">{insight.detail}</p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className={cn("h-full rounded-full", t.bar)}
                initial={{ width: 0 }}
                whileInView={{ width: `${insight.confidence * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <button className="mt-3 inline-flex items-center gap-1 text-micro font-medium text-ink-300 transition-colors group-hover:text-white">
              Investigate
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
