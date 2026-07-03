import { riskLevel, type RiskLevel } from "./utils";
import type { AnalysisDoc } from "@/models/Analysis";
import type { ReportDoc } from "@/models/Report";

/* Map Mongo documents into the exact shapes the existing frontend renders
   (mirrors the client-side types in src/lib/analysis.ts + session-types.ts). */

export type SerializedAnalysis = {
  id: string;
  kind: string;
  score: number;
  level: RiskLevel;
  verdict: string;
  summary: string;
  confidence: number;
  confidenceReasoning: string;
  executiveSummary: string;
  evidence: { type: string; value: string }[];
  ocrText?: string;
  signals: { label: string; weight: number; hit: boolean; explanation: string; riskImpact: number }[];
  recommendations: string[];
  title: string;
  preview: string;
  category: string;
  createdAt: number;
};

export type SerializedReport = {
  id: string;
  title: string;
  kind: string;
  type: string;
  status: string;
  risk: number;
  level: RiskLevel;
  date: string; // YYYY-MM-DD
  author: string;
  size: string;
  createdAt: number;
  pdfUrl: string;
  hasPdf: boolean;
  reportData: unknown;
  source: SerializedAnalysis | null;
};

function ts(doc: { createdAt?: unknown }): number {
  const v = doc.createdAt;
  if (v instanceof Date) return v.getTime();
  if (typeof v === "string" || typeof v === "number") return new Date(v).getTime();
  return Date.now();
}

export function serializeAnalysis(doc: AnalysisDoc): SerializedAnalysis {
  const score = doc.riskScore ?? 0;
  return {
    id: String(doc._id),
    kind: doc.type,
    score,
    level: riskLevel(score),
    verdict: doc.verdict,
    summary: doc.summary ?? "",
    confidence: doc.confidence ?? 0.8,
    confidenceReasoning: doc.confidenceReasoning ?? "",
    executiveSummary: doc.executiveSummary ?? "",
    evidence: (doc.evidence ?? []).map((e) => ({ type: e.type, value: e.value })),
    ocrText: doc.ocrText ?? "",
    signals: (doc.indicators ?? []).map((i) => ({ 
      label: i.label, 
      weight: i.weight, 
      hit: i.hit,
      explanation: i.explanation ?? "",
      riskImpact: i.riskImpact ?? 0
    })),
    recommendations: doc.recommendations ?? [],
    title: doc.title ?? "",
    preview: doc.preview ?? "",
    category: doc.category ?? "Uncategorized",
    createdAt: ts(doc),
  };
}

export function serializeReport(doc: ReportDoc): SerializedReport {
  const data = (doc.reportData ?? {}) as Record<string, unknown>;
  const snapshot = data.analysisSnapshot as SerializedAnalysis | undefined;
  const createdAt = ts(doc);
  return {
    id: String(doc._id),
    title: doc.title,
    kind: doc.kind ?? "report",
    type: (data.category as string) || "Investigation",
    status: "Finalized",
    risk: doc.risk ?? 0,
    level: (doc.level as RiskLevel) ?? riskLevel(doc.risk ?? 0),
    date: new Date(createdAt).toISOString().slice(0, 10),
    author: (data.analyst as string) || "FraudShield AI",
    size: (data.size as string) || "PDF",
    createdAt,
    pdfUrl: doc.pdfUrl ?? "",
    hasPdf: Boolean(doc.pdfUrl),
    reportData: doc.reportData ?? {},
    source: snapshot ?? null,
  };
}
