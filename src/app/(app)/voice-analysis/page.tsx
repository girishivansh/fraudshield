"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AudioLines,
  UploadCloud,
  Play,
  Pause,
  Sparkles,
  ShieldAlert,
  FileAudio,
  ArrowRight,
  Download,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Waveform } from "@/components/dashboard/waveform";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { RiskMeter } from "@/components/ui/risk-meter";
import { AnalysisReportViewer } from "@/components/ui/analysis-report-viewer";
import { useAuth } from "@/components/auth/auth-context";
import {
  apiAnalyzeVoice,
  apiGenerateReport,
  reportDownloadUrl,
  ApiError,
  type ClientAnalysis,
} from "@/lib/client-api";
import { riskMeta } from "@/lib/utils";

type Phase = "idle" | "analyzing" | "done";

export default function VoiceAnalysisPage() {
  const { requireAuth, addAnalysis } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ClientAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPhase("idle");
      setResult(null);
    }
  }

  async function run(snapshot: { file: File | null; transcript: string }) {
    setPhase("analyzing");
    setResult(null);
    setError(null);
    try {
      const { analysis } = await apiAnalyzeVoice({
        file: snapshot.file ?? undefined,
        transcript: snapshot.transcript.trim() || undefined,
      });
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
    if (!file && !transcript.trim()) {
      fileInput.current?.click();
      return;
    }
    const snapshot = { file, transcript };
    requireAuth(() => void run(snapshot), "voice analysis");
  }

  function reset() {
    setPhase("idle");
    setResult(null);
    setFile(null);
    setTranscript("");
    setError(null);
  }

  const meta = result ? riskMeta[result.level] : null;

  return (
    <>
      <PageHeader
        eyebrow="AI workspace"
        title="Voice Analysis"
        description="Detect synthetic and deepfake voices in calls and recordings — with spectral fingerprinting, transcript intelligence, and voiceprint matching."
        actions={
          <Badge tone="accent" dot pulse>
            Deepfake engine
          </Badge>
        }
      />

      {/* upload + player */}
      <GlassCard className="p-5">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* dropzone */}
          <input ref={fileInput} type="file" accept="audio/*" onChange={onFile} className="hidden" />
          <button
            onClick={() => fileInput.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-6 text-center transition-colors hover:border-primary-400/40 hover:bg-primary-500/[0.04]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/12 text-primary-300">
              <UploadCloud className="h-6 w-6" />
            </span>
            <p className="mt-3 text-body-sm font-medium text-ink-100">{file ? file.name : "Drop audio to analyze"}</p>
            <p className="mt-1 text-micro text-ink-500">WAV, MP3, M4A · up to 25 MB</p>
            <span className="mt-3 inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-label text-ink-200">
              Browse files
            </span>
          </button>

          {/* current file player */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/12 text-accent-300">
                  <FileAudio className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-body-sm font-semibold text-ink-100">{file ? file.name : "No file selected"}</div>
                  <div className="text-micro text-ink-500">
                    {result ? `${result.verdict}` : file ? "Ready to analyze" : "Upload a recording or paste a transcript"}
                  </div>
                </div>
              </div>
              {result && (
                <Badge tone={result.score >= 60 ? "danger" : "success"} dot pulse>
                  {result.category}
                </Badge>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => setPlaying((v) => !v)}
                disabled={!file}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-gradient text-white shadow-glow transition-transform hover:scale-105 disabled:opacity-40"
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
              </button>
              <div className="h-16 flex-1">
                <Waveform playing={playing} height={64} />
              </div>
            </div>
          </div>
        </div>

        {/* optional transcript + analyze */}
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <label className="mb-1.5 block text-micro text-ink-400">Transcript (optional — improves accuracy)</label>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={3}
              placeholder="Paste the call transcript here, or leave blank to analyze the audio file directly…"
              className="resize-none text-body-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={analyze} loading={phase === "analyzing"} size="lg">
              <Sparkles className="h-4 w-4" />
              {phase === "done" ? "Re-analyze" : "Analyze audio"}
            </Button>
            {phase === "done" && (
              <Button onClick={reset} variant="secondary" size="lg" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-danger-400/25 bg-danger-500/[0.08] px-3 py-2 text-label text-danger-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </GlassCard>

      {/* results */}
      <AnimatePresence mode="wait">
        {phase === "done" && result && meta && (
          <div className="mt-4">
            <AnalysisReportViewer key="result" analysis={result} />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}


