import Anthropic from "@anthropic-ai/sdk";

/* ============================================================
   Centralized Anthropic Claude service. ALL AI calls go through
   this module. Uses claude-opus-4-8 with structured JSON output.
   When ANTHROPIC_API_KEY is absent (or a call fails), it falls
   back to a deterministic heuristic engine so every feature stays
   functional end-to-end.
   ============================================================ */

const MODEL = "claude-sonnet-5";

import { runRuleEngine, type RuleEngineResult } from "./rule-engine";

export type Indicator = { label: string; weight: number; hit: boolean; explanation: string; riskImpact: number };

export type AiAnalysis = {
  verdict: string;
  riskScore: number; // 0..100
  confidence: number; // 0..1
  confidenceReasoning: string;
  executiveSummary: string;
  evidence: { type: string; value: string }[];
  ocrText?: string;
  category: string;
  indicators: Indicator[];
  recommendations: string[];
  summary: string;
};

export type InvestigationReport = {
  executiveSummary: string;
  threatAssessment: string;
  riskScore: number;
  confidence: number;
  evidence: string[];
  indicators: string[];
  recommendations: string[];
};

let _client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (_client) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  _client = new Anthropic({ 
    apiKey: key,
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined 
  });
  return _client;
}

export function isAiConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/* ── Structured-output JSON schema ───────────────────────────── */
const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    executiveSummary: { type: "string", description: "Short, high-level verdict (e.g. 'Almost certainly a phishing attempt')." },
    verdict: { type: "string", description: "Short verdict, e.g. 'Likely phishing'." },
    riskScore: { type: "integer", description: "0-100 fraud risk." },
    confidence: { type: "number", description: "0-1 confidence." },
    confidenceReasoning: { type: "string", description: "Explain why confidence is high or low." },
    category: {
      type: "string",
      description: "Primary scam category. Must be one of: Banking Fraud, UPI Scam, OTP Scam, KYC Scam, Job Scam, Investment Scam, Digital Arrest Scam, Tech Support Scam, Romance Scam, Lottery Scam, Unknown.",
    },
    summary: { type: "string", description: "2-3 sentence explanation." },
    evidence: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: { type: "string", description: "e.g. URL, Phone, Email, UPI, Bank Name, Company, Amount" },
          value: { type: "string" }
        },
        required: ["type", "value"]
      }
    },
    ocrText: { type: "string", description: "Extracted text content if the input is a screenshot/image." },
    fraudIndicators: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          weight: { type: "number", description: "0-1 severity of this indicator." },
          explanation: { type: "string", description: "Why this signal was flagged." },
          riskImpact: { type: "number", description: "Integer representing risk impact, e.g., 15" }
        },
        required: ["label", "weight", "explanation", "riskImpact"],
      },
    },
    legitimateIndicators: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          weight: { type: "number", description: "0-1 mitigating strength of this indicator." },
          explanation: { type: "string", description: "Why this mitigates risk." },
          riskImpact: { type: "number", description: "Negative integer representing risk reduction, e.g., -10" }
        },
        required: ["label", "weight", "explanation", "riskImpact"],
      },
    },
    recommendations: { type: "array", items: { type: "string" } },
  },
  required: ["executiveSummary", "verdict", "riskScore", "confidence", "confidenceReasoning", "category", "summary", "evidence", "fraudIndicators", "legitimateIndicators", "recommendations"],
};

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

function normalize(raw: Partial<AiAnalysis>): AiAnalysis {
  const riskScore = clamp(Math.round(Number(raw.riskScore ?? 0)), 0, 100);
  const confidence = clamp(Number(raw.confidence ?? 0.8), 0, 1);
  return {
    verdict: String(raw.verdict ?? "Analysis complete"),
    riskScore,
    confidence,
    confidenceReasoning: String(raw.confidenceReasoning ?? ""),
    executiveSummary: String(raw.executiveSummary ?? ""),
    evidence: Array.isArray(raw.evidence) ? raw.evidence.map((e) => ({ type: String(e?.type ?? ""), value: String(e?.value ?? "") })) : [],
    ocrText: raw.ocrText ? String(raw.ocrText) : undefined,
    category: String(raw.category ?? "Uncategorized"),
    summary: String(raw.summary ?? ""),
    indicators: [
      ...((raw as any).fraudIndicators || []).slice(0, 10).map((i: any) => ({
        label: String(i?.label ?? "Indicator"),
        weight: clamp(Number(i?.weight ?? 0.5), 0, 1),
        hit: true,
        explanation: String(i?.explanation ?? ""),
        riskImpact: Number(i?.riskImpact ?? 0),
      })),
      ...((raw as any).legitimateIndicators || []).slice(0, 5).map((i: any) => ({
        label: String(i?.label ?? "Indicator"),
        weight: clamp(Number(i?.weight ?? 0.5), 0, 1),
        hit: false,
        explanation: String(i?.explanation ?? ""),
        riskImpact: Number(i?.riskImpact ?? 0),
      })),
    ],
    recommendations: Array.isArray(raw.recommendations)
      ? raw.recommendations.slice(0, 8).map((r) => String(r))
      : [],
  };
}

type UserContent = string | Anthropic.MessageParam["content"];

/** Run one structured analysis via Claude. Throws on failure. */
async function runStructured(system: string, content: UserContent): Promise<AiAnalysis> {
  const client = getClient();
  if (!client) throw new Error("Anthropic API key is not configured. Please set ANTHROPIC_API_KEY.");
  
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 2500,
      system,
      messages: [{ role: "user", content: content as Anthropic.MessageParam["content"] }],
      tools: [
        {
          name: "output_analysis",
          description: "Output the fraud analysis result matching the required schema.",
          input_schema: ANALYSIS_SCHEMA as any,
        }
      ],
      tool_choice: { type: "tool", name: "output_analysis" },
    });

    const toolBlock = res.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (!toolBlock) {
      const textBlock = res.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text" && textBlock.text) {
        try {
          const rawText = textBlock.text;
          const jsonStart = rawText.indexOf("{");
          const jsonEnd = rawText.lastIndexOf("}");
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            const jsonStr = rawText.slice(jsonStart, jsonEnd + 1);
            const parsed = JSON.parse(jsonStr) as Partial<AiAnalysis>;
            return normalize(parsed);
          }
        } catch (e) {
          console.error("[claude] json parse fallback failed:", e);
        }
      }
      console.error("[claude] Res content:", JSON.stringify(res.content));
      throw new Error("No structured output returned from Anthropic.");
    }
    const parsed = toolBlock.input as Partial<AiAnalysis>;
    return normalize(parsed);
  } catch (err) {
    console.error("[claude] analysis failed:", err);
    throw new Error(`AI Analysis failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

const BASE_SYSTEM = `You are FraudShield AI, an expert fraud-investigation forensic analyst. 
You inspect user-supplied content and return a rigorous, structured, investigation-grade fraud risk assessment. 
Be precise and evidence-driven. Always return valid JSON matching the required schema. 
Risk Score (0-100) and Confidence (0-1) MUST be evaluated separately. Risk measures danger; confidence measures certainty.
Extract all concrete evidence (URLs, Phones, Emails, UPI IDs, Amounts, Bank Names) into the evidence array.
If the input is an image, provide the extracted OCR text in ocrText. Ensure you extract the sender name, phone numbers, and full message text. If sender info is missing, mark "Cannot verify sender authenticity." and increase uncertainty.
Provide 5-8 concrete fraud indicators (hit=true) detailing WHY it was flagged, and a specific risk impact score (e.g. 15).
Provide 1-3 legitimate indicators (hit=false) detailing any mitigating factors, and a specific risk reduction score (e.g. -10).
Provide 2-4 actionable recommendations.

CRITICAL SCORING RULES:
- NEVER allow the AI to directly choose arbitrary scores. Follow the weighted scoring guidelines.
- INCREASE risk score (+25) if the message claims to be from a bank but uses a generic bank name (e.g., "YourBank").
- INCREASE risk score (+20) if the user is asked to reply YES/NO or call a number (reply-based social engineering).
- INCREASE risk score (+15) if the message creates urgency or fear.
- INCREASE risk score (+15) if the sender identity cannot be explicitly verified.
- INCREASE risk score (+10) if security alerts lack account-specific details.
- INCREASE risk score (+30) for authority impersonation (police, IRS, tax).
- INCREASE risk score (+35) for unexpected lottery/prize winnings or investment guarantees.
- DO NOT reduce the risk score simply because there is no link present. Many modern smishing attacks rely on reply-based social engineering instead of malicious URLs.
- DO NOT automatically classify banking alerts as legitimate. Evaluate the sender verification and fear-based language.`;

/* ── Hybrid Scoring Engine ───────────────────────────────────── */
function applyHybridScoring(ai: AiAnalysis, ruleResult?: RuleEngineResult): AiAnalysis {
  if (!ruleResult) return ai;
  
  // Combine AI score and Rule score. Give 70% weight to whichever is higher.
  const aiScore = ai.riskScore;
  const ruleScore = ruleResult.score;
  const higher = Math.max(aiScore, ruleScore);
  const lower = Math.min(aiScore, ruleScore);
  const blendedScore = Math.round(higher * 0.7 + lower * 0.3);
  
  // Create a Map to merge indicators, preferring AI explanations for duplicates
  const indicatorMap = new Map<string, Indicator>();
  
  // Add rule signals
  ruleResult.signals.forEach(s => {
    indicatorMap.set(s.label.toLowerCase(), { ...s });
  });
  
  // Add/override with AI signals
  ai.indicators.forEach(i => {
    const key = i.label.toLowerCase();
    if (indicatorMap.has(key)) {
      // Keep AI's rich explanation but preserve rule's explicit riskImpact if AI didn't provide one
      const existing = indicatorMap.get(key)!;
      indicatorMap.set(key, { ...existing, explanation: i.explanation, weight: Math.max(existing.weight, i.weight) });
    } else {
      indicatorMap.set(key, i);
    }
  });

  return {
    ...ai,
    riskScore: blendedScore,
    indicators: Array.from(indicatorMap.values()).sort((a, b) => b.riskImpact - a.riskImpact)
  };
}

/* ── Public API ──────────────────────────────────────────────── */

export async function analyzeMessage(text: string, ruleResult?: RuleEngineResult): Promise<AiAnalysis> {
  const system = `${BASE_SYSTEM}
Focus on scam messages (SMS, chat, DM). Detect: phishing, impersonation, banking scams, digital arrest scams, urgency tactics, financial coercion, and credential theft.`;
  const ai = await runStructured(system, `Analyze this message for fraud:\n\n"""${text}"""`);
  return applyHybridScoring(ai, ruleResult);
}

export async function analyzeEmail(text: string, ruleResult?: RuleEngineResult): Promise<AiAnalysis> {
  const system = `${BASE_SYSTEM}
Focus on email fraud. Detect: phishing, sender spoofing, fake / look-alike domains, suspicious links, and social engineering.`;
  const ai = await runStructured(system, `Analyze this email for fraud:\n\n"""${text}"""`);
  return applyHybridScoring(ai, ruleResult);
}

export async function analyzeImage(imageUrl: string, note = "", ruleResult?: RuleEngineResult): Promise<AiAnalysis> {
  const system = `${BASE_SYSTEM}
You are inspecting a screenshot/image. Detect: fake payment screenshots, scam chats, phishing screenshots, fake banking screenshots, and fake receipts. Read any on-screen text.`;

  const imageBlock = toImageBlock(imageUrl);
  if (!imageBlock) {
    throw new Error("Invalid image format or URL provided.");
  }
  const content: Anthropic.MessageParam["content"] = [
    imageBlock,
    { type: "text", text: `Analyze this image for fraud indicators.${note ? ` Context: ${note}` : ""}` },
  ];
  const ai = await runStructured(system, content);
  return applyHybridScoring(ai, ruleResult);
}

export async function analyzeVoice(transcript: string, fileName = "", ruleResult?: RuleEngineResult): Promise<AiAnalysis> {
  const system = `${BASE_SYSTEM}
You are analyzing a transcribed voice call. Detect: digital arrest scams, authority impersonation (police, bank, government), pressure tactics, suspicious payment requests, and known scam scripts.`;
  const body = transcript?.trim()
    ? `Analyze this call transcript for fraud:\n\n"""${transcript}"""`
    : `A voice recording named "${fileName}" was submitted with no transcript. Assess likely fraud risk for a voice-call deepfake / social-engineering scenario.`;
  const ai = await runStructured(system, body);
  return applyHybridScoring(ai, ruleResult);
}

export async function generateInvestigationReport(input: {
  analyses: { type: string; verdict: string; riskScore: number; category: string; summary: string }[];
  title?: string;
}): Promise<InvestigationReport> {
  const client = getClient();
  if (!client) throw new Error("Anthropic API key is not configured. Please set ANTHROPIC_API_KEY.");
  
  const { analyses } = input;
  const avg = analyses.length
    ? Math.round(analyses.reduce((a, x) => a + (x.riskScore || 0), 0) / analyses.length)
    : 40;
  
  if (!analyses.length) {
    throw new Error("No analyses provided to generate report.");
  }

  try {
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        executiveSummary: { type: "string" },
        threatAssessment: { type: "string" },
        riskScore: { type: "integer" },
        confidence: { type: "number" },
        evidence: { type: "array", items: { type: "string" } },
        indicators: { type: "array", items: { type: "string" } },
        recommendations: { type: "array", items: { type: "string" } },
      },
      required: [
        "executiveSummary",
        "threatAssessment",
        "riskScore",
        "confidence",
        "evidence",
        "indicators",
        "recommendations",
      ],
    };
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: `${BASE_SYSTEM}\nYou are compiling a formal fraud investigation report from a set of prior analyses. Produce an executive summary, a threat assessment, an overall risk score (0-100), a confidence (0-1), a bullet list of evidence, key indicators, and recommended actions.`,
      messages: [
        {
          role: "user",
          content: `Compile an investigation report from these analyses:\n${JSON.stringify(analyses, null, 2)}`,
        },
      ],
      tools: [
        {
          name: "output_report",
          description: "Output the compiled investigation report matching the required schema.",
          input_schema: schema as any,
        }
      ],
      tool_choice: { type: "tool", name: "output_report" },
    });
    
    const toolBlock = res.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    let parsed: Partial<InvestigationReport> | null = null;
    if (toolBlock) {
      parsed = toolBlock.input as Partial<InvestigationReport>;
    } else {
      const textBlock = res.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text" && textBlock.text) {
        try {
          const rawText = textBlock.text;
          const jsonStart = rawText.indexOf("{");
          const jsonEnd = rawText.lastIndexOf("}");
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            const jsonStr = rawText.slice(jsonStart, jsonEnd + 1);
            parsed = JSON.parse(jsonStr) as Partial<InvestigationReport>;
          }
        } catch (e) {
          console.error("[claude] json parse fallback failed:", e);
        }
      }
    }
    
    if (parsed) {
      return {
        executiveSummary: String(parsed.executiveSummary ?? ""),
        threatAssessment: String(parsed.threatAssessment ?? ""),
        riskScore: clamp(Math.round(Number(parsed.riskScore ?? avg)), 0, 100),
        confidence: clamp(Number(parsed.confidence ?? 0.9), 0, 1),
        evidence: (parsed.evidence ?? []).map(String),
        indicators: (parsed.indicators ?? []).map(String),
        recommendations: (parsed.recommendations ?? []).map(String),
      };
    }
    throw new Error("Failed to parse report generation output.");
  } catch (err) {
    console.error("[claude] report generation failed:", err);
    throw new Error(`Report generation failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/* ── Image URL → Anthropic image block ───────────────────────── */
function toImageBlock(url: string): Anthropic.ImageBlockParam | null {
  if (url.startsWith("data:")) {
    const match = /^data:(.+?);base64,(.*)$/.exec(url);
    if (!match) return null;
    const media = match[1];
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
    const mediaType = (allowed as readonly string[]).includes(media)
      ? (media as (typeof allowed)[number])
      : "image/png";
    return { type: "image", source: { type: "base64", media_type: mediaType, data: match[2] } };
  }
  if (url.startsWith("http")) {
    return { type: "image", source: { type: "url", url } };
  }
  return null;
}


