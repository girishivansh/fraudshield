"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Seamless infinite marquee — duplicates children for a continuous loop. */
export function Marquee({
  children,
  className,
  speed = 40,
  fade = true,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  fade?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative flex w-full overflow-hidden",
        fade && "[mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]",
        className
      )}
    >
      <div
        className="flex shrink-0 items-center gap-12 pr-12 animate-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className="flex shrink-0 items-center gap-12 pr-12 animate-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
    </div>
  );
}
