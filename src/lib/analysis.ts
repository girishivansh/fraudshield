import { clamp, riskLevel, seeded, type RiskLevel } from "./utils";

/* ============================================================
   Mock analysis engine — frontend only, no backend.
   Turns raw user input (message / email / voice file / screenshot /
   report request) into a deterministic risk verdict with a full
   signal breakdown. Same input → same result (no hydration drift).
   ============================================================ */

export type AnalysisKind = "message" | "email" | "voice" | "screenshot" | "report";

export type Signal = { label: string; weight: number; hit: boolean; explanation: string; riskImpact: number };

export type AnalysisResult = {
  score: number; // 0..100
  level: RiskLevel;
  verdict: string;
  summary: string;
  confidence: number; // 0..1
  confidenceReasoning: string;
  executiveSummary: string;
  evidence: { type: string; value: string }[];
  ocrText?: string;
  signals: Signal[];
  recommendations: string[];
};

export type Analysis = AnalysisResult & {
  id: string;
  kind: AnalysisKind;
  title: string;
  preview: string;
  createdAt: number;
};

export const KIND_LABEL: Record<AnalysisKind, string> = {
  message: "Scam Message",
  email: "Email",
  voice: "Voice Call",
  screenshot: "Screenshot",
  report: "Investigation Report",
};

/* ── Keyword lexicon used for text-based scoring ─────────────── */
const LEXICON: { re: RegExp; label: string; weight: number }[] = [
  { re: /\b(urgent|immediately|within \d+\s?(h|hours|minutes)|act now|final notice|expire)\b/i, label: "Urgency & deadline pressure", weight: 0.92 },
  { re: /\b(verify|confirm|update|re-?activate)\b.*\b(account|identity|details|information)\b/i, label: "Credential-harvest call to action", weight: 0.95 },
  { re: /\b(suspend|locked|disabled|restricted|closure|terminated)\b/i, label: "Account-threat / fear framing", weight: 0.83 },
  { re: /https?:\/\/|www\.|\b[a-z0-9-]+\.(co|xyz|info|top|link|ru|tk)\b/i, label: "Suspicious / look-alike link", weight: 0.88 },
  { re: /\b(password|otp|pin|cvv|ssn|seed phrase|one[- ]?time)\b/i, label: "Sensitive-credential request", weight: 0.9 },
  { re: /\b(gift card|wire transfer|bitcoin|crypto|western union|bank transfer)\b/i, label: "Irreversible-payment demand", weight: 0.86 },
  { re: /\b(dear customer|dear user|dear member|valued customer)\b/i, label: "Generic salutation", weight: 0.46 },
  { re: /\b(won|winner|prize|reward|refund|inheritance|lottery)\b/i, label: "Too-good-to-be-true incentive", weight: 0.7 },
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function idFrom(kind: AnalysisKind, seed: number): string {
  const prefix = { message: "MSG", email: "EML", voice: "VOX", screenshot: "IMG", report: "RPT" }[kind];
  return `${prefix}-${(seed % 9000 + 1000).toString().padStart(4, "0")}`;
}

/* ── Text analyzer (message + email) ─────────────────────────── */
function analyzeText(kind: "message" | "email", input: string): AnalysisResult {
  const text = input.trim();
  const signals: Signal[] = LEXICON.map((entry) => ({
    label: entry.label,
    weight: entry.weight,
    hit: entry.re.test(text),
    explanation: `Matches pattern for ${entry.label.toLowerCase()}`,
    riskImpact: Math.round(entry.weight * 20)
  }));

  const hitWeight = signals.filter((s) => s.hit).reduce((a, s) => a + s.weight, 0);
  const maxWeight = signals.reduce((a, s) => a + s.weight, 0);
  const raw = maxWeight ? hitWeight / maxWeight : 0;
  // short/empty input dampens confidence but urgency-heavy short scams still score high
  const lengthFactor = clamp(text.length / 140, 0.35, 1);
  const score = Math.round(clamp(raw * 100 * (0.55 + 0.45 * lengthFactor), 2, 99));
  const level = riskLevel(score);

  const hitCount = signals.filter((s) => s.hit).length;
  const verdict =
    score >= 85 ? "Likely phishing" :
    score >= 65 ? "High-risk scam" :
    score >= 45 ? "Suspicious content" :
    score >= 20 ? "Low risk detected" : "Looks clean";

  const noun = kind === "email" ? "email" : "message";
  const summary =
    hitCount === 0
      ? `No known fraud indicators were found in this ${noun}. Stay alert for context we can't see.`
      : `This ${noun} triggered ${hitCount} fraud indicator${hitCount > 1 ? "s" : ""}, most notably ${signals.find((s) => s.hit)?.label.toLowerCase()}. Treat any links or requests with caution.`;

  return {
    score,
    level,
    verdict,
    summary,
    confidence: clamp(0.7 + raw * 0.28, 0.6, 0.98),
    confidenceReasoning: hitCount > 0 ? "Multiple explicit patterns match known fraud signatures." : "No explicit fraud patterns detected.",
    executiveSummary: verdict,
    evidence: [],
    signals,
    recommendations:
      score >= 45
        ? ["Do not click any links or reply", "Report as phishing to your provider", "Block the sender"]
        : ["Verify the sender through an official channel", "Save this analysis to your history"],
  };
}

/* ── Synthetic-media analyzer (voice + screenshot) ───────────── */
function analyzeMedia(kind: "voice" | "screenshot", filename: string): AnalysisResult {
  const rnd = seeded(hash(filename || kind) % 2147483647);
  const score = Math.round(clamp(58 + rnd() * 40, 2, 99));
  const level = riskLevel(score);

  const voiceSignals: Signal[] = [
    { label: "Spectral synthesis artifacts", weight: clamp(0.6 + rnd() * 0.38, 0, 1), hit: true, explanation: "Unnatural frequency bands", riskImpact: 15 },
    { label: "Unnatural prosody & cadence", weight: clamp(0.5 + rnd() * 0.4, 0, 1), hit: score > 55, explanation: "Pacing matches text-to-speech models", riskImpact: 10 },
    { label: "Voiceprint mismatch vs. known speaker", weight: clamp(0.55 + rnd() * 0.4, 0, 1), hit: score > 60, explanation: "Formant analysis shows mismatch", riskImpact: 20 },
    { label: "Social-engineering script pattern", weight: clamp(0.5 + rnd() * 0.45, 0, 1), hit: score > 50, explanation: "Keywords match known scam scripts", riskImpact: 12 },
    { label: "Background continuity anomalies", weight: clamp(0.3 + rnd() * 0.4, 0, 1), hit: score > 70, explanation: "Ambient noise drops artificially", riskImpact: 8 },
  ];
  const shotSignals: Signal[] = [
    { label: "Spoofed sender / caller ID overlay", weight: clamp(0.6 + rnd() * 0.35, 0, 1), hit: true, explanation: "Pixel inconsistencies in text", riskImpact: 15 },
    { label: "Urgency & threat language in text", weight: clamp(0.55 + rnd() * 0.4, 0, 1), hit: score > 55, explanation: "Threatening account suspension", riskImpact: 10 },
    { label: "Look-alike brand impersonation", weight: clamp(0.5 + rnd() * 0.42, 0, 1), hit: score > 60, explanation: "Logo uses incorrect aspect ratio", riskImpact: 12 },
    { label: "Payment / gift-card request visible", weight: clamp(0.45 + rnd() * 0.45, 0, 1), hit: score > 50, explanation: "Explicit financial demand", riskImpact: 18 },
    { label: "Manipulated UI / edited screenshot", weight: clamp(0.3 + rnd() * 0.4, 0, 1), hit: score > 72, explanation: "JPEG compression artifacts around text", riskImpact: 25 },
  ];
  const signals = kind === "voice" ? voiceSignals : shotSignals;

  const verdict =
    kind === "voice"
      ? score >= 85 ? "Synthetic voice — deepfake" : score >= 60 ? "Likely AI-cloned voice" : "Voice likely authentic"
      : score >= 85 ? "Confirmed scam screenshot" : score >= 60 ? "Likely fraudulent content" : "No clear fraud markers";

  const summary =
    kind === "voice"
      ? `The audio shows ${signals.filter((s) => s.hit).length} deepfake indicators. Spectral and prosody analysis suggest AI-generated speech impersonating a trusted party.`
      : `The screenshot shows ${signals.filter((s) => s.hit).length} scam indicators including impersonation and urgency framing typical of social-engineering fraud.`;

  return {
    score,
    level,
    verdict,
    summary,
    confidence: clamp(0.72 + rnd() * 0.24, 0.6, 0.98),
    confidenceReasoning: "Algorithmic detection of media manipulation features.",
    executiveSummary: verdict,
    evidence: [],
    signals,
    recommendations:
      kind === "voice"
        ? ["Do not act on instructions from this call", "Call back on a verified official number", "Report the impersonation attempt"]
        : ["Do not send any payment or codes", "Verify via the official app or website", "Report and delete the message"],
  };
}

/* ── Investigation report (aggregate over history) ───────────── */
function buildReport(analyses: Analysis[]): AnalysisResult {
  const sample = analyses.slice(0, 12);
  const avg = sample.length
    ? Math.round(sample.reduce((a, s) => a + s.score, 0) / sample.length)
    : 46;
  const high = sample.filter((s) => s.score >= 65).length;
  const level = riskLevel(avg);

  const signals: Signal[] = [
    { label: `${sample.length || "No"} analyses reviewed this session`, weight: clamp(sample.length / 12, 0.1, 1), hit: sample.length > 0, explanation: "Sample size context", riskImpact: 0 },
    { label: `${high} high-risk detections isolated`, weight: clamp(high / Math.max(sample.length, 1), 0.1, 1), hit: high > 0, explanation: "Proportion of critical events", riskImpact: high * 5 },
    { label: "Cross-channel pattern correlation run", weight: 0.8, hit: true, explanation: "Standard operating procedure", riskImpact: 0 },
    { label: "Threat exposure scored against 2.1B events", weight: 0.9, hit: true, explanation: "Historical comparison active", riskImpact: 0 },
  ];

  return {
    score: avg,
    level,
    verdict: "Investigation report generated",
    summary: `Compiled an investigation report across ${sample.length} recent analys${sample.length === 1 ? "is" : "es"}. Overall exposure is ${level}. ${high} case${high === 1 ? "" : "s"} require follow-up.`,
    confidence: 0.95,
    confidenceReasoning: "Based on empirical data over the current session.",
    executiveSummary: "Investigation completed.",
    evidence: [],
    signals,
    recommendations: ["Download the report as evidence", "Save to your investigation history", "Escalate high-risk cases"],
  };
}

export function analyzeContent(kind: AnalysisKind, input: string, history: Analysis[] = []): Analysis {
  let result: AnalysisResult;
  if (kind === "message" || kind === "email") result = analyzeText(kind, input);
  else if (kind === "voice" || kind === "screenshot") result = analyzeMedia(kind, input);
  else result = buildReport(history);

  const seed = hash(kind + "|" + input + "|" + history.length);
  const preview =
    kind === "voice" || kind === "screenshot"
      ? input || `Uploaded ${KIND_LABEL[kind].toLowerCase()}`
      : kind === "report"
        ? `${history.length} analyses · overall ${result.level}`
        : input.trim().slice(0, 120) || "—";

  const title =
    kind === "report"
      ? `Investigation report · ${new Date().toISOString().slice(0, 10)}`
      : `${KIND_LABEL[kind]} · ${result.verdict}`;

  return {
    ...result,
    id: idFrom(kind, seed),
    kind,
    title,
    preview,
    createdAt: Date.now(),
  };
}

/* ── Report export ───────────────────────────────────────────── */
export function reportText(a: Analysis): string {
  const line = "─".repeat(56);
  return [
    "FRAUDSHIELD AI — INVESTIGATION REPORT",
    line,
    `Report ID:   ${a.id}`,
    `Generated:   ${new Date(a.createdAt).toUTCString()}`,
    `Type:        ${KIND_LABEL[a.kind]}`,
    `Verdict:     ${a.verdict}`,
    `Risk score:  ${a.score}/100 (${a.level.toUpperCase()})`,
    `Confidence:  ${Math.round(a.confidence * 100)}%`,
    line,
    "SUMMARY",
    a.summary,
    "",
    "SIGNAL BREAKDOWN",
    ...a.signals.map((s) => `  [${s.hit ? "x" : " "}] ${s.label}  (${Math.round(s.weight * 100)}%)`),
    "",
    "RECOMMENDED ACTIONS",
    ...a.recommendations.map((r) => `  • ${r}`),
    line,
    "Generated by FraudShield AI · Detect. Prevent. Protect.",
  ].join("\n");
}

/** Trigger a client-side download of the report as a .txt file. */
export function downloadReport(a: Analysis) {
  if (typeof window === "undefined") return;
  const blob = new Blob([reportText(a)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${a.id}-fraudshield-report.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
