"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Map as MapIcon, Layers, Filter, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { WorldThreatMap } from "@/components/dashboard/world-threat-map";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REGIONS } from "@/lib/mock-data";
import { riskLevel, riskMeta, cn } from "@/lib/utils";

const filters = ["All vectors", "Phishing", "Payment", "Voice", "Identity", "Malware"];

export default function CrimeHeatmapPage() {
  const [active, setActive] = useState("All vectors");
  const sorted = [...REGIONS].sort((a, b) => b.intensity - a.intensity);

  return (
    <>
      <PageHeader
        eyebrow="Regional intelligence"
        title="Crime Heatmap"
        description="Watch fraud pressure shift across the globe in real time, with regional breakdowns and hotspot analytics."
        actions={
          <>
            <Button variant="secondary" size="md">
              <Layers className="h-4 w-4" />
              Layers
            </Button>
            <Button size="md">
              <TrendingUp className="h-4 w-4" />
              Export view
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* map */}
        <GlassCard className="relative overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-2">
              <MapIcon className="h-4 w-4 text-accent-300" />
              <span className="text-body-sm font-semibold text-ink-100">Global fraud pressure</span>
            </div>
            <Badge tone="success" dot pulse>
              Live telemetry
            </Badge>
          </div>

          {/* filter chips */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-5 py-3">
            <Filter className="h-3.5 w-3.5 text-ink-500" />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={cn(
                  "rounded-full border px-3 py-1 text-micro font-medium transition-colors",
                  active === f
                    ? "border-primary-400/40 bg-primary-500/15 text-primary-200"
                    : "border-white/10 bg-white/[0.02] text-ink-400 hover:text-ink-200"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <WorldThreatMap className="h-[420px] sm:h-[520px]" />

          {/* legend */}
          <div className="flex items-center gap-3 border-t border-white/[0.06] px-5 py-3">
            <span className="text-micro text-ink-500">Low</span>
            <div className="h-2 flex-1 rounded-full bg-risk-gradient" />
            <span className="text-micro text-ink-500">Critical</span>
          </div>
        </GlassCard>

        {/* regional intelligence */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-4">
              <div className="tabular text-h2 font-bold text-gradient-primary">
                {REGIONS.reduce((s, r) => s + r.cases, 0).toLocaleString()}
              </div>
              <div className="text-micro text-ink-500">active cases worldwide</div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="tabular text-h2 font-bold text-danger-400">{sorted[0].city}</div>
              <div className="text-micro text-ink-500">top hotspot right now</div>
            </GlassCard>
          </div>

          <GlassCard className="p-5">
            <span className="text-body-sm font-semibold text-ink-100">Hotspot ranking</span>
            <div className="mt-3 space-y-2">
              {sorted.map((r, i) => {
                const meta = riskMeta[riskLevel(r.intensity * 100)];
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2"
                  >
                    <span className="tabular w-5 text-center text-micro font-bold text-ink-500">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-label font-medium text-ink-100">
                        {r.city}, {r.country}
                      </div>
                      <div className="text-micro text-ink-500">{r.cases.toLocaleString()} cases</div>
                    </div>
                    <span
                      className="rounded-md px-2 py-0.5 text-micro font-semibold"
                      style={{ background: `${meta.color}22`, color: meta.color }}
                    >
                      {Math.round(r.intensity * 100)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}
