"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquareWarning,
  Mail,
  PhoneCall,
  ImageUp,
  FileBarChart,
  ArrowRight,
  Download,
  ShieldCheck,
  Sparkles,
  History,
  type LucideProps,
} from "lucide-react";
import { type ComponentType } from "react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-context";
import { type AnalysisKind } from "@/lib/analysis";
import { reportDownloadUrl } from "@/lib/client-api";
import { AI_INSIGHTS } from "@/lib/mock-data";
import { cn, riskLevel, riskMeta, timeAgo } from "@/lib/utils";

const KIND_ICON: Record<AnalysisKind, ComponentType<LucideProps>> = {
  message: MessageSquareWarning,
  email: Mail,
  voice: PhoneCall,
  screenshot: ImageUp,
  report: FileBarChart,
};

const QUICK_ACTIONS: { kind: AnalysisKind; label: string }[] = [
  { kind: "message", label: "Analyze message" },
  { kind: "email", label: "Analyze email" },
  { kind: "voice", label: "Analyze call" },
  { kind: "screenshot", label: "Upload screenshot" },
  { kind: "report", label: "Generate report" },
];

/** Personalized welcome band shown on the homepage once a user is signed in. */
export function Personalized() {
  const { user, isAuthenticated, hydrated, analyses, reports } = useAuth();
  if (!hydrated || !isAuthenticated || !user) return null;

  const recent = analyses.slice(0, 6).map((a) => ({
    id: a.id,
    kind: a.kind,
    title: a.title,
    preview: a.preview,
    score: a.score,
    ago: timeAgo(a.createdAt),
  }));

  const savedReports = reports.slice(0, 4);

  return (
    <section className="relative py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Welcome header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge tone="success" dot pulse>
                Signed in
              </Badge>
              <h2 className="mt-3 text-h1 font-bold tracking-tight text-ink-100">
                Welcome back, {user.name.split(" ")[0]}.
              </h2>
              <p className="mt-1 text-body-lg text-ink-400">
                Pick up an investigation or start a new analysis below.
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="secondary" size="md">
                <History className="h-4 w-4" /> Analysis history
              </Button>
            </Link>
          </div>

          {/* Quick actions */}
          <div className="mt-6 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((q) => {
              const Icon = KIND_ICON[q.kind];
              return (
                <a
                  key={q.kind}
                  href="#workspace"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2 text-label text-ink-200 transition-colors hover:border-primary-400/40 hover:bg-primary-500/[0.06]"
                >
                  <Icon className="h-4 w-4 text-primary-300" />
                  {q.label}
                </a>
              );
            })}
          </div>

          {/* Content grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Recent analyses */}
            <GlassCard className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-body-sm font-semibold text-ink-100">Recent analyses</span>
                <Link href="/dashboard" className="inline-flex items-center gap-1 text-micro text-primary-300 hover:text-primary-200">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {recent.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-4 py-6 text-center text-body-sm text-ink-400">
                    No analyses yet — run one from the workspace below to see it here.
                  </div>
                )}
                {recent.map((r) => {
                  const Icon = KIND_ICON[r.kind];
                  const meta = riskMeta[riskLevel(r.score)];
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-ink-300">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-sm text-ink-100">{r.title}</p>
                        <p className="truncate text-micro text-ink-500">{r.preview}</p>
                      </div>
                      <span className="hidden text-micro text-ink-500 sm:block">{r.ago}</span>
                      <span
                        className="tabular rounded-lg px-2 py-1 text-micro font-semibold ring-1"
                        style={{ color: meta.color, boxShadow: `inset 0 0 0 1px ${meta.color}33` }}
                      >
                        {r.score}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Risk insights */}
            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-300" />
                <span className="text-body-sm font-semibold text-ink-100">Risk insights</span>
              </div>
              <div className="space-y-3">
                {AI_INSIGHTS.map((ins) => {
                  const tone = riskMeta[ins.tone === "danger" ? "high" : ins.tone === "warning" ? "suspicious" : "low"];
                  return (
                    <div key={ins.id} className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone.color }} />
                        <p className="text-label font-medium text-ink-100">{ins.title}</p>
                      </div>
                      <p className="mt-1 text-micro leading-relaxed text-ink-400">{ins.detail}</p>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Saved reports */}
          <GlassCard className="mt-4 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileBarChart className="h-4 w-4 text-success-400" />
                <span className="text-body-sm font-semibold text-ink-100">Saved reports</span>
              </div>
              <Link href="/reports" className="inline-flex items-center gap-1 text-micro text-primary-300 hover:text-primary-200">
                Report center <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {savedReports.length ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {savedReports.map((rep) => {
                  const meta = riskMeta[rep.level];
                  return (
                    <div
                      key={rep.id}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-2.5"
                    >
                      <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]")} style={{ color: meta.color }}>
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-sm text-ink-100">{rep.title}</p>
                        <p className="text-micro text-ink-500">{rep.id} · {rep.date}</p>
                      </div>
                      <a
                        href={reportDownloadUrl(rep.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Download report"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-4 py-5">
                <p className="text-body-sm text-ink-400">
                  No saved reports yet — generate one from the workspace above.
                </p>
                <a href="#workspace">
                  <Button variant="outline" size="sm">
                    <FileBarChart className="h-4 w-4" /> Generate
                  </Button>
                </a>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
