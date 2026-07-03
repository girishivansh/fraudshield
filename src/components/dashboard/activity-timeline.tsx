"use client";

import { motion } from "framer-motion";
import { ACTIVITY } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const dot: Record<string, string> = {
  primary: "bg-primary-400",
  success: "bg-success-400",
  danger: "bg-danger-400",
  accent: "bg-accent-400",
  warning: "bg-warning-400",
};

export function ActivityTimeline() {
  return (
    <div className="relative">
      <span className="absolute bottom-2 left-[7px] top-2 w-px bg-white/[0.08]" />
      <ul className="space-y-4">
        {ACTIVITY.map((a, i) => (
          <motion.li
            key={a.id}
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative flex gap-3 pl-0.5"
          >
            <span className={cn("relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-ink-925", dot[a.tone] ?? "bg-ink-400")} />
            <div className="min-w-0 flex-1">
              <p className="text-body-sm text-ink-200">
                <span className="font-semibold text-ink-100">{a.actor}</span> {a.action}{" "}
                <span className="text-ink-300">{a.target}</span>
              </p>
              <span className="text-micro text-ink-500">{a.ago}</span>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
