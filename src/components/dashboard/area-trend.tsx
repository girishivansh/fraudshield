"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { TREND_24H } from "@/lib/mock-data";

type Point = (typeof TREND_24H)[number];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-ink-850/95 px-3 py-2 shadow-glass backdrop-blur-xl">
      <div className="mb-1 text-micro text-ink-500">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-label">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize text-ink-300">{p.name}</span>
          <span className="tabular ml-auto font-semibold text-ink-100">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function AreaTrend({ height = 280 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={TREND_24H} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="gThreats" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gBlocked" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="t"
          tick={{ fill: "#64748B", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={3}
        />
        <YAxis tick={{ fill: "#64748B", fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.12)" }} />
        <Area
          type="monotone"
          dataKey="threats"
          stroke="#60A5FA"
          strokeWidth={2.5}
          fill="url(#gThreats)"
          animationDuration={1400}
        />
        <Area
          type="monotone"
          dataKey="blocked"
          stroke="#22D3EE"
          strokeWidth={2}
          fill="url(#gBlocked)"
          animationDuration={1600}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
