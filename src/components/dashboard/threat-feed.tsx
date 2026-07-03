"use client";

import { motion } from "framer-motion";
import { THREAT_FEED, type ThreatEvent } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

const sevDot: Record<ThreatEvent["severity"], string> = {
  critical: "bg-danger-500 shadow-glow-danger",
  high: "bg-warning-500",
  medium: "bg-accent-400",
  low: "bg-success-500",
};

const statusTone: Record<ThreatEvent["status"], "success" | "danger" | "warning" | "accent"> = {
  blocked: "success",
  neutralized: "success",
  flagged: "warning",
  investigating: "accent",
};

export function ThreatFeed({ limit = 6 }: { limit?: number }) {
  return (
    <motion.div
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="show"
      className="divide-y divide-white/[0.05]"
    >
      {THREAT_FEED.slice(0, limit).map((t) => (
        <motion.div
          key={t.id}
          variants={fadeUp}
          className="group flex items-center gap-3 px-1 py-3 transition-colors hover:bg-white/[0.02]"
        >
          <span className={cn("mt-1 h-2 w-2 shrink-0 self-start rounded-full", sevDot[t.severity])} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-body-sm font-medium text-ink-100">{t.type}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-micro text-ink-500">
              <span className="font-mono text-ink-400">{t.id}</span>
              <span>·</span>
              <span>{t.vector}</span>
              <span>·</span>
              <span>{t.location}</span>
              <span>·</span>
              <span>{t.ago}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="tabular hidden text-body-sm font-semibold text-ink-200 sm:block">{t.score}</span>
            <Badge tone={statusTone[t.status]} className="capitalize">
              {t.status}
            </Badge>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
