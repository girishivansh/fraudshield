"use client";

import type { AnalysisKind, Signal } from "@/lib/analysis";
import type { RiskLevel } from "@/lib/utils";

/* ============================================================
   Client-side API layer. Every browser → backend call goes
   through here. Talks to the /api routes, unwraps the shared
   { ok, data } / { ok, error } envelope, and throws ApiError
   on failure so callers can surface a message.
   ============================================================ */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type ClientUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  initials: string;
  createdAt: string;
};

/** Mirrors src/lib/serialize.ts → SerializedAnalysis (kind narrowed to AnalysisKind). */
export type ClientAnalysis = {
  id: string;
  kind: AnalysisKind;
  score: number;
  level: RiskLevel;
  verdict: string;
  summary: string;
  confidence: number;
  confidenceReasoning: string;
  executiveSummary: string;
  evidence: { type: string; value: string }[];
  ocrText?: string;
  signals: Signal[];
  recommendations: string[];
  title: string;
  preview: string;
  category: string;
  createdAt: number;
};

/** Mirrors src/lib/serialize.ts → SerializedReport. */
export type ClientReport = {
  id: string;
  title: string;
  kind: AnalysisKind;
  type: string;
  status: string;
  risk: number;
  level: RiskLevel;
  date: string;
  author: string;
  size: string;
  createdAt: number;
  pdfUrl: string;
  hasPdf: boolean;
  source: ClientAnalysis | null;
};

export type DashboardData = {
  totalAnalyses: number;
  averageRiskScore: number;
  highRisk: number;
  reportsCount: number;
  scamCategories: { name: string; value: number; color: string }[];
  monthlyTrends: { month: string; totalAnalyses: number; avgRisk: number; highRisk: number }[];
  threatExposure: { label: string; value: string; tone: "danger" | "warning" | "success" | "primary" | "accent"; hint: string }[];
  recentActivity: ClientAnalysis[];
  savedReports: ClientReport[];
};

type Envelope<T> = { ok: true; data: T } | { ok: false; error: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { credentials: "include", cache: "no-store", ...init });
  } catch {
    throw new ApiError("Network error — is the server running?", 0);
  }

  let body: Envelope<T> | null = null;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    /* non-JSON response */
  }

  if (!res.ok || !body || body.ok === false) {
    const message = body && body.ok === false ? body.error : `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return body.data;
}

const jsonInit = (method: string, payload: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

/* ── Auth ────────────────────────────────────────────────────── */
export const apiMe = () => request<{ user: ClientUser | null }>("/api/auth/me");

export const apiLogin = (email: string, password: string) =>
  request<{ user: ClientUser }>("/api/auth/login", jsonInit("POST", { email, password }));

export const apiRegister = (payload: { name: string; email: string; password: string; company?: string }) =>
  request<{ user: ClientUser }>("/api/auth/register", jsonInit("POST", payload));

export const apiLogout = () => request<{ loggedOut: boolean }>("/api/auth/logout", { method: "POST" });

/* ── Analysis ────────────────────────────────────────────────── */
export const apiAnalyzeMessage = (input: string) =>
  request<{ analysis: ClientAnalysis }>("/api/analyze/message", jsonInit("POST", { input }));

export const apiAnalyzeEmail = (input: string) =>
  request<{ analysis: ClientAnalysis }>("/api/analyze/email", jsonInit("POST", { input }));

export const apiAnalyzeVoice = (args: { file?: File; transcript?: string }) => {
  const form = new FormData();
  if (args.file) form.append("file", args.file);
  if (args.transcript) form.append("transcript", args.transcript);
  return request<{ analysis: ClientAnalysis }>("/api/analyze/voice", { method: "POST", body: form });
};

export const apiAnalyzeImage = (args: { file: File; note?: string }) => {
  const form = new FormData();
  form.append("file", args.file);
  if (args.note) form.append("note", args.note);
  return request<{ analysis: ClientAnalysis }>("/api/analyze/image", { method: "POST", body: form });
};

/* ── Dashboard / history ─────────────────────────────────────── */
export const apiDashboard = () => request<DashboardData>("/api/dashboard");

export const apiHistory = () =>
  request<{ analyses: ClientAnalysis[]; reports: ClientReport[] }>("/api/history");

/* ── Reports ─────────────────────────────────────────────────── */
export const apiReports = (params: { search?: string; type?: string } = {}) => {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.type) qs.set("type", params.type);
  const suffix = qs.toString() ? `?${qs}` : "";
  return request<{ reports: ClientReport[] }>(`/api/reports${suffix}`);
};

export const apiGenerateReport = (payload: { analysisId?: string; title?: string } = {}) =>
  request<{ report: ClientReport }>("/api/reports/generate", jsonInit("POST", payload));

export const apiDeleteReport = (id: string) =>
  request<{ deleted: boolean; id: string }>(`/api/reports/${id}`, { method: "DELETE" });

/** Direct link to stream a report's PDF (opened in a new tab / anchor). */
export const reportDownloadUrl = (id: string) => `/api/reports/${id}/download`;
