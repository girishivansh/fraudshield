"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { VECTOR_BREAKDOWN } from "@/lib/mock-data";

export function VectorDonut({ size = 200 }: { size?: number }) {
  const total = VECTOR_BREAKDOWN.reduce((s, v) => s + v.value, 0);
  return (
    <div className="flex items-center gap-5">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={VECTOR_BREAKDOWN}
              dataKey="value"
              innerRadius="66%"
              outerRadius="100%"
              paddingAngle={3}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              animationDuration={1200}
            >
              {VECTOR_BREAKDOWN.map((v) => (
                <Cell key={v.name} fill={v.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-h2 font-bold text-ink-50">{total}%</span>
          <span className="text-micro text-ink-500">tracked</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {VECTOR_BREAKDOWN.map((v) => (
          <div key={v.name} className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: v.color }} />
            <span className="flex-1 text-label text-ink-300">{v.name}</span>
            <span className="tabular text-label font-semibold text-ink-100">{v.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
