import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Conditional className merge (clsx + tailwind-merge). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number between min and max. */
export const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

/** Linear interpolation. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 1,234,567 → "1,234,567" */
export const formatNumber = (n: number) => n.toLocaleString("en-US");

/** 1_240_000 → "1.24M" */
export function formatCompact(n: number, digits = 1): string {
  const units = [
    { v: 1e12, s: "T" },
    { v: 1e9, s: "B" },
    { v: 1e6, s: "M" },
    { v: 1e3, s: "K" },
  ];
  for (const u of units) {
    if (Math.abs(n) >= u.v) return (n / u.v).toFixed(digits).replace(/\.0+$/, "") + u.s;
  }
  return String(n);
}

/** 0.9234 → "92.3%" */
export const formatPercent = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;

/** USD currency, compact. */
export const formatCurrency = (n: number) =>
  "$" + formatCompact(n, n >= 1e6 ? 2 : 1);

/** "3 minutes ago" style relative time from an ISO/epoch. */
export function timeAgo(date: number | Date): string {
  const d = typeof date === "number" ? date : date.getTime();
  const secs = Math.round((Date.now() - d) / 1000);
  const table: [number, string][] = [
    [60, "s"],
    [3600, "m"],
    [86400, "h"],
    [604800, "d"],
  ];
  if (secs < 5) return "just now";
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

/** Map a 0–100 risk score to a semantic level. */
export type RiskLevel = "safe" | "low" | "suspicious" | "high" | "critical";
export function riskLevel(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "suspicious";
  if (score >= 20) return "low";
  return "safe";
}

export const riskMeta: Record<
  RiskLevel,
  { label: string; color: string; ring: string; text: string; bg: string }
> = {
  safe: { label: "Safe", color: "#34D399", ring: "ring-success/30", text: "text-success-400", bg: "bg-success/10" },
  low: { label: "Low Risk", color: "#22D3EE", ring: "ring-accent/30", text: "text-accent-300", bg: "bg-accent/10" },
  suspicious: { label: "Suspicious", color: "#F59E0B", ring: "ring-warning/30", text: "text-warning-400", bg: "bg-warning/10" },
  high: { label: "High Risk", color: "#F87171", ring: "ring-danger/30", text: "text-danger-400", bg: "bg-danger/10" },
  critical: { label: "Critical", color: "#EF4444", ring: "ring-danger/40", text: "text-danger-400", bg: "bg-danger/15" },
};

/** Deterministic pseudo-random (seeded) — avoids hydration mismatch. */
export function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
