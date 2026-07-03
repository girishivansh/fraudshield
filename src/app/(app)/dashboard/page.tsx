"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquareWarning,
  Mail,
  PhoneCall,
  ImageUp,
  FileBarChart,
  Plus,
  ArrowRight,
  Download,
  ShieldAlert,
  TrendingUp,
  History,
  Sparkles,
  AlertCircle,
  type LucideProps,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { AreaTrend } from "@/components/dashboard/area-trend";
import { AIInsights } from "@/components/dashboard/ai-insight-card";
import { AuthGate } from "@/components/dashboard/auth-gate";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiDashboard, reportDownloadUrl, ApiError, type DashboardData } from "@/lib/client-api";
import { cn, riskLevel, riskMeta, timeAgo } from "@/lib/utils";

const KIND_ICON: Record<string, ComponentType<LucideProps>> = {
  message: MessageSquareWarning,
  email: Mail,
  voice: PhoneCall,
  screenshot: ImageUp,
  report: FileBarChart,
};

const exposureColor: Record<string, string> = {
  danger: "#F87171",
  warning: "#F59E0B",
  success: "#34D399",
  primary: "#6366F1",
  accent: "#22D3EE",
};

function PanelHead({
  icon: Icon,
  title,
  action,
}: {
  icon: ComponentType<LucideProps>;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent-300" />
        <span className="text-body-sm font-semibold text-ink-100">{title}</span>
      </div>
      {action}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGate label="the intelligence center">
      <DashboardContent />
    </AuthGate>
  );
}

function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    apiDashboard()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : "Failed to load your intelligence."));
    return () => {
      alive = false;
    };
  }, []);

  const tiles = data
    ? [
        { label: "Total analyses", value: data.totalAnalyses.toLocaleString(), icon: History, level: "low" as const },
        { label: "High-risk detections", value: data.highRisk.toLocaleString(), icon: ShieldAlert, level: "high" as const },
        { label: "Reports generated", value: data.reportsCount.toLocaleString(), icon: FileBarChart, level: "safe" as const },
        { label: "Avg. risk score", value: `${data.averageRiskScore} / 100`, icon: TrendingUp, level: "suspicious" as const },
      ]
    : [];

  const maxCategory = data ? Math.max(1, ...data.scamCategories.map((c) => c.value)) : 1;

  return (
    <>
      <PageHeader
        eyebrow="Your intelligence"
        title="Analysis History & Intelligence Center"
        description="Review everything you've analyzed, track your personal threat exposure, and download investigation reports. Start a new analysis anytime from the workspace."
        actions={
          <Link href="/#workspace">
            <Button size="md">
              <Plus className="h-4 w-4" />
              New analysis
            </Button>
          </Link>
        }
      />

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger-400/25 bg-danger-500/[0.08] px-4 py-3 text-body-sm text-danger-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!data && !error ? (
        <LoadingState />
      ) : data ? (
        <>
          {/* Metric tiles */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {tiles.map((t, i) => {
              const meta = riskMeta[t.level];
              return (
                <motion.div key={t.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GlassCard className="p-5">
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", meta.bg)}>
                      <t.icon className="h-4 w-4" style={{ color: meta.color }} />
                    </span>
                    <div className="mt-3 tabular text-h2 font-bold text-ink-50">{t.value}</div>
                    <div className="text-micro text-ink-500">{t.label}</div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>

          {/* History + threat exposure */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <GlassCard className="xl:col-span-2">
              <PanelHead
                icon={History}
                title="Analysis history"
                action={
                  <Badge tone="neutral">
                    {data.recentActivity.length} record{data.recentActivity.length === 1 ? "" : "s"}
                  </Badge>
                }
              />
              <div className="divide-y divide-white/[0.05]">
                {data.recentActivity.length === 0 && <EmptyRow label="No analyses yet — run one from the workspace." />}
                {data.recentActivity.map((r, i) => {
                  const Icon = KIND_ICON[r.kind] ?? FileBarChart;
                  const meta = riskMeta[riskLevel(r.score)];
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-ink-300">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-body-sm font-semibold text-ink-100">{r.title}</p>
                          <Badge tone={r.score >= 60 ? "danger" : r.score >= 40 ? "warning" : "success"} dot className="hidden sm:inline-flex">
                            {r.category}
                          </Badge>
                        </div>
                        <p className="truncate text-micro text-ink-500 mt-0.5">{r.preview}</p>
                      </div>
                      <div className="hidden shrink-0 flex-col items-end sm:flex mr-4">
                        <span className="text-micro font-medium text-ink-300">Confidence</span>
                        <span className="text-micro text-ink-500">{Math.round(r.confidence * 100)}%</span>
                      </div>
                      <span className="hidden shrink-0 text-micro text-ink-500 sm:block mr-4">{timeAgo(r.createdAt)}</span>
                      <span
                        className="tabular shrink-0 rounded-lg px-2 py-1 text-micro font-semibold"
                        style={{ color: meta.color, boxShadow: `inset 0 0 0 1px ${meta.color}33` }}
                      >
                        {r.score}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-danger-400" />
                <span className="text-body-sm font-semibold text-ink-100">Personal threat exposure</span>
              </div>
              <div className="space-y-3">
                {data.threatExposure.map((e) => (
                  <div key={e.label} className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-label text-ink-200">{e.label}</span>
                      <span className="tabular text-h4 font-bold" style={{ color: exposureColor[e.tone] ?? "#6366F1" }}>
                        {e.value}
                      </span>
                    </div>
                    <p className="mt-0.5 text-micro text-ink-500">{e.hint}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Fraud trends + scam categories */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <GlassCard className="xl:col-span-2">
              <PanelHead icon={TrendingUp} title="Fraud activity trend" action={<Badge tone="primary">Recent</Badge>} />
              <div className="p-4 pt-2">
                <AreaTrend height={260} />
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-300" />
                <span className="text-body-sm font-semibold text-ink-100">Scam categories</span>
              </div>
              <div className="space-y-3">
                {data.scamCategories.length === 0 && <p className="text-body-sm text-ink-500">No categories yet.</p>}
                {data.scamCategories.map((c) => (
                  <div key={c.name}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-label text-ink-300">{c.name}</span>
                      <span className="tabular text-label font-semibold text-ink-100">{c.value}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: c.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(c.value / maxCategory) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Saved reports + AI recommendations */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <GlassCard className="xl:col-span-2">
              <PanelHead
                icon={FileBarChart}
                title="Saved investigation reports"
                action={
                  <Link href="/reports">
                    <Button variant="ghost" size="sm">
                      Report center <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                }
              />
              <div className="divide-y divide-white/[0.05]">
                {data.savedReports.length === 0 && <EmptyRow label="No reports yet — generate one from the workspace." />}
                {data.savedReports.map((rep) => {
                  const meta = riskMeta[riskLevel(rep.risk)];
                  return (
                    <div key={rep.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]" style={{ color: meta.color }}>
                        <FileBarChart className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-sm text-ink-100">{rep.title}</p>
                        <p className="text-micro text-ink-500">{rep.date}</p>
                      </div>
                      <span className="tabular hidden shrink-0 rounded-lg px-2 py-1 text-micro font-semibold sm:block" style={{ color: meta.color, boxShadow: `inset 0 0 0 1px ${meta.color}33` }}>
                        {rep.risk}
                      </span>
                      <a
                        href={reportDownloadUrl(rep.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Download report"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard>
              <PanelHead icon={Sparkles} title="AI recommendations" action={<Badge tone="primary">Live</Badge>} />
              <div className="p-4">
                <AIInsights />
              </div>
            </GlassCard>
          </div>
        </>
      ) : null}
    </>
  );
}

function EmptyRow({ label }: { label: string }) {
  return <div className="px-5 py-8 text-center text-body-sm text-ink-500">{label}</div>;
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/[0.03]" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-white/[0.03]" />
    </div>
  );
}
