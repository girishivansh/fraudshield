"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScanSearch,
  Sparkles,
  ShieldAlert,
  Check,
  X,
  RotateCcw,
  Wand2,
  Download,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RiskMeter } from "@/components/ui/risk-meter";
import { Progress } from "@/components/ui/progress";
import { AnalysisReportViewer } from "@/components/ui/analysis-report-viewer";
import { useAuth } from "@/components/auth/auth-context";
import {
  apiAnalyzeMessage,
  apiAnalyzeEmail,
  apiGenerateReport,
  reportDownloadUrl,
  ApiError,
  type ClientAnalysis,
} from "@/lib/client-api";
import { SCAM_SAMPLE } from "@/lib/mock-data";
import { cn, riskMeta } from "@/lib/utils";

type Phase = "idle" | "analyzing" | "done";

export default function ScamAnalyzerPage() {
  const { requireAuth, addAnalysis } = useAuth();
  const [text, setText] = useState(SCAM_SAMPLE);
  const [channel, setChannel] = useState("email");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ClientAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(snapshot: { text: string; channel: string }) {
    setPhase("analyzing");
    setResult(null);
    setError(null);
    try {
      const { analysis } =
        snapshot.channel === "email"
          ? await apiAnalyzeEmail(snapshot.text)
          : await apiAnalyzeMessage(snapshot.text);
      addAnalysis(analysis);
      setResult(analysis);
      setPhase("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Analysis failed. Please try again.");
      setPhase("idle");
    }
  }

  function analyze() {
    setError(null);
    if (!text.trim()) return;
    const snapshot = { text, channel };
    requireAuth(() => void run(snapshot), "the scam analyzer");
  }

  function reset() {
    setPhase("idle");
    setResult(null);
    setError(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="AI workspace"
        title="Scam Analyzer"
        description="Paste any message, email, or URL. The AI engine returns an instant risk verdict with a full breakdown of every signal that drove the decision."
        actions={
          <Badge tone="primary" dot pulse>
            Engine v4.2
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ── Input workspace ─────────────────────────────── */}
        <GlassCard className="flex flex-col p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScanSearch className="h-4 w-4 text-primary-300" />
              <span className="text-body-sm font-semibold text-ink-100">Content to analyze</span>
            </div>
            <Select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              options={[
                { label: "Email", value: "email" },
                { label: "SMS", value: "sms" },
                { label: "Chat message", value: "chat" },
                { label: "URL", value: "url" },
              ]}
              containerClassName="w-32"
            />
          </div>

          <div className="relative">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="min-h-[240px] resize-none font-mono text-body-sm leading-relaxed"
            />
            {/* scanning overlay */}
            <AnimatePresence>
              {phase === "analyzing" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
                >
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary-500/25 to-transparent animate-scan" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setText(SCAM_SAMPLE)}
              className="inline-flex items-center gap-1.5 text-micro text-ink-400 hover:text-ink-200"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Load sample
            </button>
            <span className="text-micro text-ink-500">{text.length} characters</span>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-danger-400/25 bg-danger-500/[0.08] px-3 py-2 text-label text-danger-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button onClick={analyze} loading={phase === "analyzing"} size="lg" className="flex-1" disabled={!text.trim()}>
              <Sparkles className="h-4 w-4" />
              {phase === "done" ? "Re-analyze" : "Analyze with AI"}
            </Button>
            {phase === "done" && (
              <Button onClick={reset} variant="secondary" size="lg">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </GlassCard>

        {/* ── Result panel ────────────────────────────────── */}
        <div className="min-h-[420px]">
          <AnimatePresence mode="wait">
            {phase === "idle" && <IdleState key="idle" />}
            {phase === "analyzing" && <AnalyzingState key="analyzing" />}
            {phase === "done" && result && <AnalysisReportViewer key="done" analysis={result} />}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

function IdleState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-300 ring-1 ring-primary-400/20">
        <ScanSearch className="h-8 w-8" />
      </span>
      <h3 className="mt-4 text-h4 font-semibold text-ink-100">Ready to analyze</h3>
      <p className="mt-1 max-w-xs text-body-sm text-ink-400">
        Run the AI engine to see a full risk verdict, signal breakdown, and recommended actions.
      </p>
    </motion.div>
  );
}

function AnalyzingState() {
  const steps = ["Parsing content", "Checking domains & links", "Scoring against 2.1B events", "Correlating signals"];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass-panel flex h-full min-h-[420px] flex-col items-center justify-center p-8"
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute h-full w-full animate-ping-slow rounded-full bg-primary-500/30" />
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-gradient shadow-glow-lg">
          <Sparkles className="h-8 w-8 text-white" />
        </span>
      </div>
      <h3 className="mt-6 text-h4 font-semibold text-ink-100">Analyzing…</h3>
      <div className="mt-4 w-full max-w-xs space-y-2">
        {steps.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.35 }}
            className="flex items-center gap-2 text-body-sm text-ink-300"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success-500/20">
              <Check className="h-3 w-3 text-success-400" />
            </span>
            {s}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}


