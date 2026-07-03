"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "success" | "warning" | "danger" | "risk";

const fills: Record<Tone, string> = {
  primary: "bg-primary-gradient",
  accent: "bg-gradient-to-r from-accent-400 to-accent-600",
  success: "bg-gradient-to-r from-success-400 to-success-600",
  warning: "bg-gradient-to-r from-warning-400 to-warning-600",
  danger: "bg-gradient-to-r from-danger-400 to-danger-600",
  risk: "bg-risk-gradient",
};

export function Progress({
  value,
  tone = "primary",
  className,
  showValue = false,
  label,
  size = "md",
}: {
  value: number; // 0..100
  tone?: Tone;
  className?: string;
  showValue?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const v = Math.max(0, Math.min(100, value));
  const h = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-micro text-ink-400">
          {label && <span>{label}</span>}
          {showValue && <span className="tabular text-ink-200">{Math.round(v)}%</span>}
        </div>
      )}
      <div className={cn("relative w-full overflow-hidden rounded-full bg-white/[0.06]", h)}>
        <motion.div
          className={cn("relative h-full rounded-full", fills[tone])}
          initial={{ width: 0 }}
          whileInView={{ width: `${v}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="absolute inset-0 bg-shine bg-[length:200%_100%] opacity-40 animate-shimmer" />
        </motion.div>
      </div>
    </div>
  );
}
