"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Share2, Snowflake, ArrowUpRight, FolderPlus, Fingerprint } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { FraudGraph, typeColor } from "@/components/dashboard/fraud-graph";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { GRAPH_NODES, GRAPH_LINKS, type GraphNode } from "@/lib/mock-data";
import { riskLevel, riskMeta, cn } from "@/lib/utils";

const legend = [
  { type: "kingpin", label: "Beneficiary" },
  { type: "wallet", label: "Wallet" },
  { type: "account", label: "Account" },
  { type: "device", label: "Device" },
  { type: "phone", label: "Phone" },
] as const;

export default function FraudNetworkPage() {
  const [active, setActive] = useState<GraphNode>(GRAPH_NODES[0]);

  const connections = useMemo(() => {
    const ids = new Set<string>();
    GRAPH_LINKS.forEach((l) => {
      if (l.source === active.id) ids.add(l.target);
      if (l.target === active.id) ids.add(l.source);
    });
    return GRAPH_NODES.filter((n) => ids.has(n.id));
  }, [active]);

  const exposure = GRAPH_NODES.reduce((s, n) => s + n.risk, 0) * 1240;
  const meta = riskMeta[riskLevel(active.risk)];

  return (
    <>
      <PageHeader
        eyebrow="Advanced investigation tool"
        title="Fraud Network"
        description="A power-user tool for deep investigations: live graph intelligence connecting accounts, devices, wallets, and phone signals — so a single mule reveals the entire ring."
        actions={
          <>
            <Badge tone="accent">Advanced</Badge>
            <Select
              options={[
                { label: "Cluster · Beneficiary α", value: "a" },
                { label: "Cluster · Ring β", value: "b" },
              ]}
              containerClassName="w-52"
            />
            <Button variant="secondary" size="md">
              <Snowflake className="h-4 w-4" />
              Freeze cluster
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* graph */}
        <GlassCard className="relative overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-accent-300" />
              <span className="text-body-sm font-semibold text-ink-100">Cluster graph · Beneficiary α</span>
            </div>
            <Badge tone="danger" dot pulse>
              Active ring
            </Badge>
          </div>

          {/* stat overlay */}
          <div className="pointer-events-none absolute left-5 top-16 z-10 flex gap-2">
            {[
              { k: "Entities", v: GRAPH_NODES.length },
              { k: "Links", v: GRAPH_LINKS.length },
              { k: "Exposure", v: `$${(exposure / 1000).toFixed(0)}K` },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-white/10 bg-ink-900/60 px-3 py-1.5 backdrop-blur-md">
                <div className="tabular text-body-sm font-bold text-ink-50">{s.v}</div>
                <div className="text-micro text-ink-500">{s.k}</div>
              </div>
            ))}
          </div>

          <div className="h-[440px] w-full sm:h-[520px]">
            <FraudGraph activeId={active.id} onSelect={setActive} />
          </div>

          {/* legend */}
          <div className="flex flex-wrap gap-3 border-t border-white/[0.06] px-5 py-3">
            {legend.map((l) => (
              <span key={l.type} className="flex items-center gap-1.5 text-micro text-ink-400">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: typeColor[l.type] }} />
                {l.label}
              </span>
            ))}
          </div>
        </GlassCard>

        {/* investigation panel */}
        <div className="space-y-4">
          <motion.div key={active.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-micro uppercase tracking-widest text-ink-500">Selected entity</span>
                <Badge tone="neutral" className="capitalize">
                  {active.type}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-white/10"
                  style={{ background: `${typeColor[active.type]}22`, color: typeColor[active.type] }}
                >
                  <Fingerprint className="h-6 w-6" />
                </span>
                <div>
                  <div className="font-mono text-body font-semibold text-ink-50">{active.label}</div>
                  <div className="text-micro text-ink-500">{connections.length} direct connections</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <span className="text-label text-ink-300">Risk score</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full" style={{ width: `${active.risk}%`, background: meta.color }} />
                  </div>
                  <span className="tabular text-body-sm font-bold" style={{ color: meta.color }}>
                    {active.risk}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <PanelAction icon={Snowflake} label="Freeze" />
                <PanelAction icon={ArrowUpRight} label="Escalate" />
                <PanelAction icon={FolderPlus} label="Add" />
              </div>
            </GlassCard>
          </motion.div>

          <GlassCard className="p-5">
            <span className="text-body-sm font-semibold text-ink-100">Connected entities</span>
            <div className="mt-3 space-y-1.5">
              {connections.map((c) => {
                const cm = riskMeta[riskLevel(c.risk)];
                return (
                  <button
                    key={c.id}
                    onClick={() => setActive(c)}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: typeColor[c.type] }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-label text-ink-100">{c.label}</div>
                      <div className="text-micro capitalize text-ink-500">{c.type}</div>
                    </div>
                    <span className="tabular text-label font-semibold" style={{ color: cm.color }}>
                      {c.risk}
                    </span>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}

function PanelAction({ icon: Icon, label }: { icon: typeof Snowflake; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] py-2.5 text-micro text-ink-300 transition-colors hover:bg-white/[0.05] hover:text-white">
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
