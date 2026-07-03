import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "success" | "warning" | "danger" | "neutral";

const tones: Record<Tone, string> = {
  primary: "text-primary-300 bg-primary-500/12 border-primary-400/25",
  accent: "text-accent-300 bg-accent-500/12 border-accent-400/25",
  success: "text-success-400 bg-success-500/12 border-success-400/25",
  warning: "text-warning-400 bg-warning-500/12 border-warning-400/25",
  danger: "text-danger-400 bg-danger-500/12 border-danger-400/25",
  neutral: "text-ink-300 bg-white/[0.05] border-white/10",
};

const dotTones: Record<Tone, string> = {
  primary: "bg-primary-400",
  accent: "bg-accent-400",
  success: "bg-success-400",
  warning: "bg-warning-400",
  danger: "bg-danger-400",
  neutral: "bg-ink-400",
};

export function Badge({
  children,
  tone = "neutral",
  dot = false,
  pulse = false,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-micro font-medium backdrop-blur-sm",
        tones[tone],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping-slow", dotTones[tone])} />
          )}
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dotTones[tone])} />
        </span>
      )}
      {children}
    </span>
  );
}
