"use client";

import { motion } from "framer-motion";
import { Radar } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorldThreatMap } from "@/components/dashboard/world-threat-map";
import { THREAT_FEED, VECTOR_BREAKDOWN } from "@/lib/mock-data";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function ThreatIntel() {
  return (
    <section id="threat-intel" className="relative py-section">
      <div className="shell">
        <SectionHeading
          eyebrow="Threat intelligence"
          title={<>The whole world&apos;s fraud, <span className="text-gradient-primary">on one screen</span></>}
          description="Live telemetry from 190+ countries, correlated into a single situational picture your team can act on in real time."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {/* map */}
          <GlassCard className="relative overflow-hidden lg:col-span-2">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-2">
                <Radar className="h-4 w-4 text-accent-300" />
                <span className="text-label text-ink-200">Global threat surveillance</span>
              </div>
              <Badge tone="success" dot pulse>
                Streaming
              </Badge>
            </div>
            <WorldThreatMap className="h-[320px] sm:h-[380px]" />
          </GlassCard>

          {/* feed + breakdown */}
          <div className="flex flex-col gap-4">
            <GlassCard className="flex-1 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-label text-ink-200">Live feed</span>
                <Badge tone="danger" dot pulse>
                  6 critical
                </Badge>
              </div>
              <motion.div
                variants={staggerContainer(0.07)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="space-y-2"
              >
                {THREAT_FEED.slice(0, 5).map((t) => (
                  <motion.div
                    key={t.id}
                    variants={fadeUp}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2"
                  >
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        t.severity === "critical" && "bg-danger-500 shadow-glow-danger",
                        t.severity === "high" && "bg-warning-500",
                        t.severity === "medium" && "bg-accent-400",
                        t.severity === "low" && "bg-success-500"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-label text-ink-100">{t.type}</div>
                      <div className="text-micro text-ink-500">
                        {t.location} · {t.ago}
                      </div>
                    </div>
                    <span className="tabular text-label font-semibold text-ink-200">{t.score}</span>
                  </motion.div>
                ))}
              </motion.div>
            </GlassCard>

            <GlassCard className="p-5">
              <span className="text-label text-ink-200">Attack vectors</span>
              <div className="mt-3 space-y-2.5">
                {VECTOR_BREAKDOWN.map((v) => (
                  <div key={v.name}>
                    <div className="mb-1 flex items-center justify-between text-micro">
                      <span className="text-ink-300">{v.name}</span>
                      <span className="tabular text-ink-400">{v.value}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: v.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${v.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
