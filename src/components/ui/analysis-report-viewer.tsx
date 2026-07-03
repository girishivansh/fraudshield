"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ArrowRight,
  Download,
  AlertCircle,
  Check,
  X,
  FileText,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Phone,
  Mail,
  Banknote,
  Search,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiskMeter } from "@/components/ui/risk-meter";
import { Progress } from "@/components/ui/progress";
import { cn, riskMeta } from "@/lib/utils";
import { apiGenerateReport, reportDownloadUrl, ApiError, type ClientAnalysis } from "@/lib/client-api";

export function AnalysisReportViewer({ analysis }: { analysis: ClientAnalysis }) {
  const meta = riskMeta[analysis.level];
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showOcr, setShowOcr] = useState(false);

  async function download() {
    setBusy(true);
    setErr(null);
    try {
      const { report } = await apiGenerateReport({ analysisId: analysis.id, title: analysis.title });
      window.open(reportDownloadUrl(report.id), "_blank");
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not generate the report.");
    } finally {
      setBusy(false);
    }
  }

  function getEvidenceIcon(type: string) {
    const t = type.toLowerCase();
    if (t.includes("url") || t.includes("link")) return <LinkIcon className="h-4 w-4" />;
    if (t.includes("phone")) return <Phone className="h-4 w-4" />;
    if (t.includes("email")) return <Mail className="h-4 w-4" />;
    if (t.includes("amount") || t.includes("bank") || t.includes("upi")) return <Banknote className="h-4 w-4" />;
    return <Search className="h-4 w-4" />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* ── 1. Executive Summary & Verdict ── */}
      <GlassCard glow className="overflow-hidden">
        <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center shrink-0">
            <RiskMeter score={analysis.score} size={150} label="scam risk" />
            <Badge tone={analysis.score >= 60 ? "danger" : analysis.score >= 40 ? "warning" : "success"} className="mt-4">
              {analysis.category}
            </Badge>
          </div>
          
          <div className="flex-1 text-center sm:text-left space-y-4">
            <div>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <ShieldAlert className="h-5 w-5" style={{ color: meta.color }} />
                <h3 className="text-h3 font-bold" style={{ color: meta.color }}>
                  {analysis.verdict}
                </h3>
              </div>
              <p className="mt-2 text-body-lg font-medium text-ink-100">
                {analysis.executiveSummary || analysis.summary}
              </p>
              <p className="mt-1 text-body-sm text-ink-300">{analysis.summary}</p>
            </div>
            
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-label font-semibold text-ink-200">AI Confidence Score</span>
                <span className="text-label font-bold text-ink-100">{Math.round(analysis.confidence * 100)}%</span>
              </div>
              <Progress value={analysis.confidence * 100} tone="primary" size="sm" />
              {analysis.confidenceReasoning && (
                <p className="mt-2 text-micro text-ink-400">
                  <Sparkles className="inline h-3 w-3 mr-1 text-primary-400" />
                  {analysis.confidenceReasoning}
                </p>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── 2. Threat Signals ── */}
      {analysis.signals && analysis.signals.length > 0 && (
    <GlassCard className="p-6">
      <div className="mb-4 flex flex-col gap-2 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-accent-400" />
          <h4 className="text-h4 font-semibold text-ink-100">Analysis Breakdown</h4>
        </div>
        <div className="flex gap-2">
          {analysis.signals.some((s) => s.hit) && (
            <Badge tone="danger">
              {analysis.signals.filter((s) => s.hit).length} Threat Signals
            </Badge>
          )}
          {analysis.signals.some((s) => !s.hit) && (
            <Badge tone="success">
              {analysis.signals.filter((s) => !s.hit).length} Mitigating Signals
            </Badge>
          )}
        </div>
      </div>
      
      {/* Fraud Indicators */}
      {analysis.signals.some(s => s.hit) && (
        <div className="mb-6">
          <h5 className="mb-3 text-body-sm font-semibold text-danger-300">Fraud Indicators</h5>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {analysis.signals.filter(s => s.hit).map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col gap-2 rounded-xl border border-danger-500/20 bg-danger-500/5 p-4 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-500/20 text-danger-400">
                    <X className="h-3 w-3" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm font-semibold text-ink-100">{s.label}</span>
                      {s.riskImpact > 0 && <Badge tone="danger" className="ml-2">+{s.riskImpact} Risk</Badge>}
                    </div>
                    {s.explanation && <p className="mt-1 text-body-sm text-ink-300">{s.explanation}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Legitimate Indicators */}
      {analysis.signals.some(s => !s.hit) && (
        <div>
          <h5 className="mb-3 text-body-sm font-semibold text-success-300">Mitigating Factors</h5>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {analysis.signals.filter(s => !s.hit).map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col gap-2 rounded-xl border border-success-500/20 bg-success-500/5 p-4 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-500/20 text-success-400">
                    <Check className="h-3 w-3" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm font-semibold text-ink-100">{s.label}</span>
                      {s.riskImpact < 0 && <Badge tone="success" className="ml-2">{s.riskImpact} Risk</Badge>}
                    </div>
                    {s.explanation && <p className="mt-1 text-body-sm text-ink-300">{s.explanation}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
      )}

      {/* ── 3. Evidence Extraction ── */}
      {analysis.evidence && analysis.evidence.length > 0 && (
        <GlassCard className="p-6">
          <h4 className="mb-4 text-h4 font-semibold text-ink-100 border-b border-white/5 pb-4">Extracted Evidence</h4>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {analysis.evidence.map((ev, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/20 text-primary-300">
                  {getEvidenceIcon(ev.type)}
                </span>
                <div className="flex-1 overflow-hidden">
                  <div className="text-micro font-medium uppercase tracking-wider text-ink-400">{ev.type}</div>
                  <div className="truncate text-body-sm font-semibold text-ink-100" title={ev.value}>{ev.value}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* ── 4. OCR / Content Extraction ── */}
      {analysis.ocrText && (
        <GlassCard className="overflow-hidden">
          <button 
            onClick={() => setShowOcr(!showOcr)}
            className="flex w-full items-center justify-between p-6 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-400" />
              <h4 className="text-h4 font-semibold text-ink-100">Extracted Text (OCR)</h4>
            </div>
            {showOcr ? <ChevronUp className="h-5 w-5 text-ink-400" /> : <ChevronDown className="h-5 w-5 text-ink-400" />}
          </button>
          <AnimatePresence>
            {showOcr && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/5 bg-black/20"
              >
                <div className="p-6 font-mono text-body-sm text-ink-300 whitespace-pre-wrap">
                  {analysis.ocrText}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      )}

      {/* ── 5. Recommended Actions & Footer ── */}
      <GlassCard className="p-6">
        <span className="text-body-sm font-semibold text-ink-100">Recommended Actions</span>
        <ul className="mt-3 space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          {analysis.recommendations.map((r, i) => (
            <li key={i} className="flex items-start gap-3 text-body-sm text-ink-200">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-400">
                <ArrowRight className="h-3 w-3" />
              </span>
              <span className="mt-0.5">{r}</span>
            </li>
          ))}
        </ul>
        {err && (
          <div className="mt-4 flex items-center gap-2 text-micro text-danger-300 bg-danger-500/10 p-2 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {err}
          </div>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/5 pt-6">
          <Button onClick={download} loading={busy} variant="primary" size="lg" className="shadow-glow">
            <Download className="h-4 w-4" /> Save &amp; Download PDF Report
          </Button>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              View History <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <span className="ml-auto text-micro text-ink-500">
            Analysis ID: <span className="font-mono text-ink-400">{analysis.id}</span>
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
}
