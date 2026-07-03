"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  label,
  description,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60",
          checked
            ? "border-primary-400/50 bg-primary-gradient shadow-glow"
            : "border-white/10 bg-white/[0.06]"
        )}
      >
        <span
          className="absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-md transition-transform duration-300 ease-spring"
          style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-body-sm font-medium text-ink-100">{label}</span>}
          {description && <span className="text-micro text-ink-500">{description}</span>}
        </span>
      )}
    </label>
  );
}
