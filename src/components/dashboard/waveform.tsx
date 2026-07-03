"use client";

import { useEffect, useRef, useState } from "react";
import { seeded } from "@/lib/utils";

/** Animated audio waveform with a sweeping playhead. */
export function Waveform({
  bars = 72,
  playing = false,
  height = 120,
}: {
  bars?: number;
  playing?: boolean;
  height?: number;
}) {
  const heights = useRef<number[]>(
    (() => {
      const rnd = seeded(42);
      return Array.from({ length: bars }).map((_, i) => {
        const env = Math.sin((i / bars) * Math.PI); // envelope
        return 0.15 + env * (0.35 + rnd() * 0.6);
      });
    })()
  );
  const [progress, setProgress] = useState(0.34);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      setProgress((p) => (p >= 1 ? 0 : p + 0.004));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const gap = 3;
  const barW = 4;
  const width = bars * (barW + gap);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="wavePlayed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      {heights.current.map((h, i) => {
        const x = i * (barW + gap);
        const bh = h * height;
        const played = i / bars <= progress;
        return (
          <rect
            key={i}
            x={x}
            y={(height - bh) / 2}
            width={barW}
            height={bh}
            rx={2}
            fill={played ? "url(#wavePlayed)" : "rgba(148,163,184,0.22)"}
            style={
              playing && Math.abs(i / bars - progress) < 0.03
                ? { filter: "drop-shadow(0 0 6px rgba(96,165,250,0.8))" }
                : undefined
            }
          />
        );
      })}
      {/* playhead */}
      <line
        x1={progress * width}
        y1={0}
        x2={progress * width}
        y2={height}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={1}
      />
    </svg>
  );
}
