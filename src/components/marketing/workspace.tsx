"use client";

import { useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquareWarning,
  Mail,
  PhoneCall,
  ImageUp,
  FileBarChart,
  Sparkles,
  ScanSearch,
  Check,
  X,
  RotateCcw,
  Wand2,
  Download,
  ArrowRight,
  UploadCloud,
  ShieldAlert,
  AlertCircle,
  type LucideProps,
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { RiskMeter } from "@/components/ui/risk-meter";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/motion/reveal";
import { useAuth } from "@/components/auth/auth-context";
import { KIND_LABEL, type AnalysisKind } from "@/lib/analysis";
import {
  apiAnalyzeMessage,
  apiAnalyzeEmail,
  apiAnalyzeVoice,
  apiAnalyzeImage,
  apiGenerateReport,
  reportDownloadUrl,
  ApiError,
  type ClientAnalysis,
  type ClientReport,
} from "@/lib/client-api";
import { SCAM_SAMPLE } from "@/lib/mock-data";
import { cn, riskMeta } from "@/lib/utils";

type Feature = {
  kind: AnalysisKind;
  title: string;
  blurb: string;
  cta: string;
  icon: ComponentType<LucideProps>;
  mode: "text" | "upload" | "generate";
  accept?: string;
  tone: "primary" | "accent" | "warning" | "danger" | "success";
};

const FEATURES: Feature[] = [
  { kind: "message", title: "Analyze Scam Message", blurb: "Paste an SMS, DM, or chat and get an instant risk verdict.", cta: "Analyze message", icon: MessageSquareWarning, mode: "text", tone: "primary" },
  { kind: "email", title: "Analyze Email", blurb: "Detect phishing, spoofed senders, and credential traps.", cta: "Analyze email", icon: Mail, mode: "text", tone: "accent" },
  { kind: "voice", title: "Analyze Voice Call", blurb: "Upload a recording to expose AI-cloned deepfake voices.", cta: "Analyze audio", icon: PhoneCall, mode: "upload", accept: "audio/*", tone: "warning" },
  { kind: "screenshot", title: "Upload Screenshot", blurb: "Scan a screenshot of any message for scam indicators.", cta: "Analyze image", icon: ImageUp, mode: "upload", accept: "image/*", tone: "danger" },
  { kind: "report", title: "Generate Investigation Report", blurb: "Compile your analyses into a downloadable case file.", cta: "Generate report", icon: FileBarChart, mode: "generate", tone: "success" },
];

const toneRing: Record<Feature["tone"], string> = {
  primary: "text-primary-300 bg-primary-500/10 ring-primary-400/20",
  accent: "text-accent-300 bg-accent-500/10 ring-accent-400/20",
  warning: "text-warning-400 bg-warning-500/10 ring-warning-400/20",
  danger: "text-danger-400 bg-danger-500/10 ring-danger-400/20",
  success: "text-success-400 bg-success-500/10 ring-success-400/20",
};

type Phase = "idle" | "analyzing" | "done";

/** Build a display-only analysis from a generated report (report kind has no signals). */
function reportToAnalysis(report: ClientReport, count: number): ClientAnalysis {
  return {
    id: report.id,
    kind: "report",
    score: report.risk,
    level: report.level,
    verdict: "Investigation report generated",
    summary: `Compiled an investigation report across ${count || "your"} recent analys${count === 1 ? "is" : "es"}. Overall exposure is ${report.risk}/100.`,
    confidence: 0.95,
    confidenceReasoning: "Based on aggregate analysis of recent cases.",
    executiveSummary: `Compiled an investigation report across ${count || "your"} recent analys${count === 1 ? "is" : "es"}. Overall exposure is ${report.risk}/100.`,
    evidence: [],
    signals: [],
    recommendations: ["Download the report as evidence", "Escalate high-risk cases", "Review the full case file in the report center"],
    title: report.title,
    preview: `${count} analyses · overall ${report.level}`,
    category: report.type,
    createdAt: report.createdAt,
  };
}

export function Workspace() {
  const { requireAuth, isAuthenticated, addAnalysis, addReport, analyses } = useAuth();
  const [active, setActive] = useState<Feature>(FEATURES[0]);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ClientAnalysis | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function selectFeature(f: Feature) {
    setActive(f);
    setPhase("idle");
    setResult(null);
    setReportId(null);
    setFile(null);
    setError(null);
  }

  // The actual (post-auth) run. Captures payload at call time so login resumes it verbatim.
  async function run(feature: Feature, snapshot: { text: string; file: File | null }) {
    setPhase("analyzing");
    setResult(null);
    setReportId(null);
    setError(null);
    try {
      let analysis: ClientAnalysis;
      if (feature.kind === "message") {
        analysis = (await apiAnalyzeMessage(snapshot.text)).analysis;
      } else if (feature.kind === "email") {
        analysis = (await apiAnalyzeEmail(snapshot.text)).analysis;
      } else if (feature.kind === "voice") {
        analysis = (await apiAnalyzeVoice({ file: snapshot.file ?? undefined })).analysis;
      } else if (feature.kind === "screenshot") {
        if (!snapshot.file) throw new ApiError("Please choose an image to analyze.", 400);
        analysis = (await apiAnalyzeImage({ file: snapshot.file })).analysis;
      } else {
        const { report } = await apiGenerateReport({});
        addReport(report);
        setReportId(report.id);
        setResult(reportToAnalysis(report, analyses.length));
        setPhase("done");
        return;
      }
      addAnalysis(analysis);
      setResult(analysis);
      setPhase("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Analysis failed. Please try again.");
      setPhase("idle");
    }
  }

  function onRun() {
    setError(null);
    if (active.mode === "text" && !text.trim()) return;
    if (active.mode === "upload" && !file) {
      fileInput.current?.click();
      return;
    }
    const snapshot = { text, file };
    requireAuth(() => {
      void run(active, snapshot);
    }, active.cta);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function generateReport(analysis: ClientAnalysis): Promise<ClientReport> {
    const { report } = await apiGenerateReport({ analysisId: analysis.id, title: analysis.title });
    addReport(report);
    return report;
  }

  const canRun = active.mode === "generate" || (active.mode === "text" ? text.trim().length > 0 : !!file);

  return (
    <section id="workspace" className="relative scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="primary" dot pulse>
              Fraud Investigation Workspace
            </Badge>
            <h2 className="mt-4 text-balance text-h1 font-bold tracking-tight text-ink-100 sm:text-display-sm">
              Start investigating in seconds
            </h2>
            <p className="mt-3 text-balance text-body-lg text-ink-400">
              Paste a message, upload a call or screenshot, and let the AI engine return an instant
              risk verdict. No dashboards to learn — the product starts right here.
            </p>
          </div>
        </Reveal>

        {/* Feature cards */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {FEATURES.map((f, i) => {
            const isActive = f.kind === active.kind;
            return (
              <Reveal key={f.kind} delay={i * 0.05}>
                <button
                  onClick={() => selectFeature(f)}
                  className={cn(
                    "group flex h-full w-full flex-col rounded-3xl border p-4 text-left transition-all duration-300",
                    isActive
                      ? "border-primary-400/40 bg-primary-500/[0.07] shadow-glow"
                      : "border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                  )}
                >
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl ring-1", toneRing[f.tone])}>
                    <f.icon className="h-5 w-5" />
                  </span>
                  <span className="mt-3 text-body-sm font-semibold text-ink-100">{f.title}</span>
                  <span className="mt-1 text-micro leading-relaxed text-ink-400">{f.blurb}</span>
                  <span
                    className={cn(
                      "mt-3 inline-flex items-center gap-1 text-micro font-medium transition-colors",
                      isActive ? "text-primary-300" : "text-ink-500 group-hover:text-ink-300"
                    )}
                  >
                    {f.cta}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>

        {/* Input + result */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Input surface */}
          <GlassCard className="flex flex-col p-5">
            <div className="mb-4 flex items-center gap-2">
              <active.icon className="h-4 w-4 text-primary-300" />
              <span className="text-body-sm font-semibold text-ink-100">{active.title}</span>
              {!isAuthenticated && (
                <Badge tone="warning" className="ml-auto">
                  Sign-in required
                </Badge>
              )}
            </div>

            {active.mode === "text" && (
              <>
                <div className="relative">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={9}
                    placeholder={active.kind === "email" ? "Paste the full email, including sender and links…" : "Paste the suspicious message…"}
                    className="min-h-[220px] resize-none font-mono text-body-sm leading-relaxed"
                  />
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
              </>
            )}

            {active.mode === "upload" && (
              <>
                <input ref={fileInput} type="file" accept={active.accept} onChange={onFile} className="hidden" />
                <button
                  onClick={() => fileInput.current?.click()}
                  className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-white/[0.01] p-6 text-center transition-colors hover:border-primary-400/40 hover:bg-primary-500/[0.04]"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-300 ring-1 ring-primary-400/20">
                    <UploadCloud className="h-7 w-7" />
                  </span>
                  <span className="mt-3 text-body-sm font-semibold text-ink-100">
                    {file?.name || `Drop ${active.kind === "voice" ? "audio" : "an image"} to analyze`}
                  </span>
                  <span className="mt-1 text-micro text-ink-500">
                    {active.kind === "voice" ? "WAV, MP3, M4A · up to 25 MB" : "PNG, JPG · up to 15 MB"}
                  </span>
                </button>
              </>
            )}

            {active.mode === "generate" && (
              <div className="flex min-h-[220px] flex-col justify-center rounded-2xl border border-white/[0.07] bg-white/[0.01] p-6">
                <FileBarChart className="h-8 w-8 text-success-400" />
                <h3 className="mt-3 text-h4 font-semibold text-ink-100">Compile an investigation report</h3>
                <p className="mt-1 text-body-sm text-ink-400">
                  Aggregate {analyses.length || "your"} recent analys{analyses.length === 1 ? "is" : "es"} into a
                  downloadable case file with an overall exposure score and recommended actions.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-danger-400/25 bg-danger-500/[0.08] px-3 py-2 text-label text-danger-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button onClick={onRun} loading={phase === "analyzing"} size="lg" className="flex-1" disabled={!canRun && active.mode !== "upload"}>
                <Sparkles className="h-4 w-4" />
                {phase === "done" ? `Re-run ${KIND_LABEL[active.kind]}` : active.cta}
              </Button>
              {phase === "done" && (
                <Button onClick={() => selectFeature(active)} variant="secondary" size="lg" aria-label="Reset">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </GlassCard>

          {/* Result */}
          <div className="min-h-[420px]">
            <AnimatePresence mode="wait">
              {phase === "idle" && <IdleState key="idle" label={active.cta} />}
              {phase === "analyzing" && <AnalyzingState key="analyzing" kind={active.kind} />}
              {phase === "done" && result && (
                <ResultState
                  key="done"
                  analysis={result}
                  reportId={reportId}
                  onGenerate={() => generateReport(result)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function IdleState({ label }: { label: string }) {
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
      <h3 className="mt-4 text-h4 font-semibold text-ink-100">Your verdict appears here</h3>
      <p className="mt-1 max-w-xs text-body-sm text-ink-400">
        Hit <span className="text-ink-200">{label}</span> to get a full risk score, signal breakdown, and
        recommended actions.
      </p>
    </motion.div>
  );
}

function AnalyzingState({ kind }: { kind: AnalysisKind }) {
  const steps =
    kind === "voice"
      ? ["Decoding audio", "Extracting spectral features", "Matching against voiceprints", "Scoring deepfake markers"]
      : kind === "screenshot"
        ? ["Reading image", "Extracting on-screen text", "Detecting impersonation", "Correlating scam signals"]
        : kind === "report"
          ? ["Gathering analyses", "Correlating patterns", "Scoring exposure", "Compiling case file"]
          : ["Parsing content", "Checking domains & links", "Scoring against 2.1B events", "Correlating signals"];
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

function ResultState({
  analysis,
  reportId,
  onGenerate,
}: {
  analysis: ClientAnalysis;
  reportId: string | null;
  onGenerate: () => Promise<ClientReport>;
}) {
  const meta = riskMeta[analysis.level];
  const [busy, setBusy] = useState(false);
  const [rid, setRid] = useState<string | null>(reportId);
  const [err, setErr] = useState<string | null>(null);

  async function saveAndDownload() {
    setBusy(true);
    setErr(null);
    try {
      let id = rid;
      if (!id) {
        const report = await onGenerate();
        id = report.id;
        setRid(id);
      }
      window.open(reportDownloadUrl(id), "_blank");
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not generate the report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* verdict */}
      <GlassCard glow className="overflow-hidden">
        <div className="flex flex-col items-center gap-5 p-5 sm:flex-row">
          <RiskMeter score={analysis.score} size={150} label="risk score" />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <ShieldAlert className="h-5 w-5" style={{ color: meta.color }} />
              <h3 className="text-h3 font-bold" style={{ color: meta.color }}>
                {analysis.verdict}
              </h3>
            </div>
            <p className="mt-1 text-body-sm text-ink-300">{analysis.summary}</p>
            <div className="mt-3">
              <Progress value={analysis.confidence * 100} tone="primary" size="sm" label="AI confidence" showValue />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* signals */}
      {analysis.signals.length > 0 && (
        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-body-sm font-semibold text-ink-100">Signals detected</span>
            <Badge tone="danger">
              {analysis.signals.filter((s) => s.hit).length} / {analysis.signals.length} triggered
            </Badge>
          </div>
          <div className="space-y-2.5">
            {analysis.signals.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3"
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    s.hit ? "bg-danger-500/15 text-danger-400" : "bg-white/5 text-ink-500"
                  )}
                >
                  {s.hit ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                </span>
                <span className={cn("flex-1 text-body-sm", s.hit ? "text-ink-200" : "text-ink-500")}>{s.label}</span>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className={cn("h-full rounded-full", s.hit ? "bg-danger-500" : "bg-ink-600")}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.weight * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.06 }}
                  />
                </div>
                <span className="tabular w-9 text-right text-micro text-ink-400">{Math.round(s.weight * 100)}%</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* actions */}
      <GlassCard className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-body-sm font-semibold text-ink-100">Recommended actions</span>
          <span className="inline-flex items-center gap-1 text-micro text-success-400">
            <Check className="h-3.5 w-3.5" /> Saved to your history
          </span>
        </div>
        <ul className="space-y-2">
          {analysis.recommendations.map((r) => (
            <li key={r} className="flex items-start gap-2 text-body-sm text-ink-200">
              <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-300" />
              {r}
            </li>
          ))}
        </ul>
        {err && (
          <div className="mt-3 flex items-center gap-2 text-micro text-danger-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {err}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={saveAndDownload} loading={busy} variant="secondary" size="sm">
            <Download className="h-4 w-4" /> Save &amp; download PDF
          </Button>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              View history <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </GlassCard>
    </motion.div>
  );
}
