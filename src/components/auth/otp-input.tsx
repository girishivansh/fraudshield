"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function OtpInput({ length = 6, onComplete }: { length?: number; onComplete?: (v: string) => void }) {
  const [vals, setVals] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function set(i: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...vals];
    next[i] = digit;
    setVals(next);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
    if (next.every((d) => d) && next.join("").length === length) onComplete?.(next.join(""));
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !vals[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
  }

  function onPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array(length).fill("");
    text.split("").forEach((d, idx) => (next[idx] = d));
    setVals(next);
    refs.current[Math.min(text.length, length - 1)]?.focus();
    if (text.length === length) onComplete?.(text);
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3" onPaste={onPaste}>
      {vals.map((v, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={v}
          inputMode="numeric"
          maxLength={1}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
          className={cn(
            "h-14 w-full rounded-xl border bg-white/[0.03] text-center text-h3 font-semibold text-ink-50 outline-none backdrop-blur-md transition-all duration-200",
            v
              ? "border-primary-400/50 bg-primary-500/10 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
              : "border-white/10 focus:border-primary-400/60 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
          )}
        />
      ))}
    </div>
  );
}
