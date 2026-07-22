import Groq from "groq-sdk";

/* ============================================================
   Centralized Groq AI service. ALL AI calls go through
   this module. Uses llama-3.3-70b-versatile with structured JSON output.
   When GROQ_API_KEY is absent (or a call fails), it falls
   back to a deterministic heuristic engine so every feature stays
   functional end-to-end.
   ============================================================ */

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

let _client: Groq | null = null;
function getClient(): Groq | null {
  if (_client) return _client;
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  _client = new Groq({ 
    apiKey: key,
  });
  return _client;
}

export function isAiConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

function getModel(isVision = false): string {
  if (isVision) {
    return process.env.GROQ_VISION_MODEL || "llama-3.2-90b-vision-preview";
  }
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}

/* ── Structured-output JSON schema ───────────────────────────── */

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

const JSON_SCHEMA_INSTRUCTIONS = `
You MUST return ONLY a valid JSON object. Do not include markdown formatting or additional text.
The JSON object must perfectly match this structure:
{
  "executiveSummary": "Short, high-level verdict (e.g. 'Almost certainly a phishing attempt').",
  "verdict": "Short verdict, e.g. 'Likely phishing'.",
  "riskScore": 0-100,
  "confidence": 0-1,
  "confidenceReasoning": "Explain why confidence is high or low.",
  "category": "Banking Fraud, UPI Scam, OTP Scam, KYC Scam, Job Scam, Investment Scam, Digital Arrest Scam, Tech Support Scam, Romance Scam, Lottery Scam, Unknown.",
  "summary": "2-3 sentence explanation.",
  "evidence": [{"type": "URL/Phone/Email/UPI/Bank Name/Company/Amount", "value": "..."}],
  "ocrText": "Extracted text content if the input is a screenshot/image (optional).",
  "fraudIndicators": [{"label": "...", "weight": 0-1, "explanation": "Why this signal was flagged.", "riskImpact": 15}],
  "legitimateIndicators": [{"label": "...", "weight": 0-1, "explanation": "Why this mitigates risk.", "riskImpact": -10}],
  "recommendations": ["...", "..."]
}
`;

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
- DO NOT automatically classify banking alerts as legitimate. Evaluate the sender verification and fear-based language.

${JSON_SCHEMA_INSTRUCTIONS}`;

/** Run one structured analysis via Groq. Throws on failure. */
async function runStructured(system: string, userContent: any, isVision = false): Promise<AiAnalysis> {
  const client = getClient();
  if (!client) throw new Error("Groq API key is not configured. Please set GROQ_API_KEY.");
  
  try {
    const messages: any[] = [
      { role: "system", content: system },
      { role: "user", content: userContent }
    ];
    
    const options: any = {
      model: getModel(isVision),
      messages,
      temperature: 0,
    };
    if (!isVision) {
      options.response_format = { type: "json_object" };
    }
    
    const res = await client.chat.completions.create(options);

    let rawText = res.choices[0]?.message?.content || "";
    if (rawText.includes("```")) {
      const match = rawText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (match) rawText = match[1];
    }
    const parsed = JSON.parse(rawText) as Partial<AiAnalysis>;
    return normalize(parsed);
  } catch (err) {
    console.error("[groq] analysis failed:", err);
    throw new Error(`AI Analysis failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/* ── Hybrid Scoring Engine ───────────────────────────────────── */
function applyHybridScoring(ai: AiAnalysis, ruleResult?: RuleEngineResult): AiAnalysis {
  if (!ruleResult) return ai;
  
  // Combine AI score and Rule score. Give 70% weight to whichever is higher.
  const aiScore = ai.riskScore;
  const ruleScore = ruleResult.score;
  const higher = Math.max(aiScore, ruleScore);
  const lower = Math.min(aiScore, ruleScore);
  const blendedScore = Math.round(higher * 0.7 + lower * 0.3);

  let updatedVerdict = ai.verdict;
  const oldCategory = aiScore >= 70 ? 'High' : aiScore >= 40 ? 'Medium' : 'Low';
  const newCategory = blendedScore >= 70 ? 'High' : blendedScore >= 40 ? 'Medium' : 'Low';
  
  if (oldCategory !== newCategory) {
    if (newCategory === 'High') updatedVerdict = "Likely Fraudulent (Rule Match)";
    else if (newCategory === 'Medium') updatedVerdict = "Suspicious (Rule Match)";
    else updatedVerdict = "Likely Safe";
  }
  
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
    verdict: updatedVerdict,
    indicators: Array.from(indicatorMap.values()).sort((a, b) => b.riskImpact - a.riskImpact)
  };
}

/* ── Public API ──────────────────────────────────────────────── */

function getFallbackAnalysis(ruleResult: RuleEngineResult | undefined, defaultCategory: string): AiAnalysis {
  const score = ruleResult ? ruleResult.score : 0;
  let verdict = "Analysis complete";
  
  if (!ruleResult) {
    verdict = "Unknown Risk";
  } else if (score >= 70) {
    verdict = "Likely Fraudulent";
  } else if (score >= 40) {
    verdict = "Suspicious";
  } else {
    verdict = "Likely Safe";
  }

  return {
    verdict,
    riskScore: score,
    confidence: 0.5,
    confidenceReasoning: "Score generated via deterministic heuristic engine due to AI unavailability.",
    executiveSummary: `Heuristic scan completed. Risk score evaluated at ${score}/100.`,
    evidence: [],
    category: defaultCategory,
    summary: "The AI service is currently unavailable. This result was generated by the fallback rule engine.",
    indicators: ruleResult ? ruleResult.signals.map(s => ({
      label: s.label,
      weight: s.weight,
      hit: s.hit,
      explanation: s.explanation,
      riskImpact: s.riskImpact,
    })) : [],
    recommendations: ["Proceed with caution", "Verify sender identity manually"],
  };
}

export async function analyzeMessage(text: string, ruleResult?: RuleEngineResult): Promise<AiAnalysis> {
  const system = `${BASE_SYSTEM}
Focus on scam messages (SMS, chat, DM). Detect: phishing, impersonation, banking scams, digital arrest scams, urgency tactics, financial coercion, and credential theft.`;
  try {
    const ai = await runStructured(system, `Analyze this message for fraud:\n\n"""${text}"""`);
    return applyHybridScoring(ai, ruleResult);
  } catch (err) {
    console.warn("[groq] Falling back to rule engine for message.", err);
    return getFallbackAnalysis(ruleResult, "Scam Message");
  }
}

export async function analyzeEmail(text: string, ruleResult?: RuleEngineResult): Promise<AiAnalysis> {
  const system = `${BASE_SYSTEM}
Focus on email fraud. Detect: phishing, sender spoofing, fake / look-alike domains, suspicious links, and social engineering.`;
  try {
    const ai = await runStructured(system, `Analyze this email for fraud:\n\n"""${text}"""`);
    return applyHybridScoring(ai, ruleResult);
  } catch (err) {
    console.warn("[groq] Falling back to rule engine for email.", err);
    return getFallbackAnalysis(ruleResult, "Email Fraud");
  }
}

export async function analyzeImage(imageUrl: string, note = "", ruleResult?: RuleEngineResult): Promise<AiAnalysis> {
  const system = `${BASE_SYSTEM}
You are inspecting a screenshot/image. Detect: fake payment screenshots, scam chats, phishing screenshots, fake banking screenshots, and fake receipts. Read any on-screen text.`;
  try {
    const content = [
      { type: "text", text: `Analyze this image for fraud indicators.${note ? ` Context: ${note}` : ""}` },
      { type: "image_url", image_url: { url: imageUrl } }
    ];
    // Passing true to indicate this requires a vision model
    const ai = await runStructured(system, content, true);
    
    let finalRuleResult = ruleResult;
    if (ai.ocrText) {
      const combinedText = `${note}\n${ai.ocrText}`.trim();
      finalRuleResult = runRuleEngine(combinedText);
    }
    
    return applyHybridScoring(ai, finalRuleResult);
  } catch (err) {
    console.warn("[groq] Falling back to rule engine for image.", err);
    return getFallbackAnalysis(ruleResult, "Image Analysis");
  }
}

export async function analyzeVoice(transcript: string, fileName = "", ruleResult?: RuleEngineResult): Promise<AiAnalysis> {
  const system = `${BASE_SYSTEM}
You are analyzing a transcribed voice call. Detect: digital arrest scams, authority impersonation (police, bank, government), pressure tactics, suspicious payment requests, and known scam scripts.`;
  try {
    const body = transcript?.trim()
      ? `Analyze this call transcript for fraud:\n\n"""${transcript}"""`
      : `A voice recording named "${fileName}" was submitted with no transcript. Assess likely fraud risk for a voice-call deepfake / social-engineering scenario.`;
    const ai = await runStructured(system, body);
    return applyHybridScoring(ai, ruleResult);
  } catch (err) {
    console.warn("[groq] Falling back to rule engine for voice.", err);
    return getFallbackAnalysis(ruleResult, "Voice Call");
  }
}

export async function generateInvestigationReport(input: {
  analyses: { type: string; verdict: string; riskScore: number; category: string; summary: string }[];
  title?: string;
}): Promise<InvestigationReport> {
  const { analyses } = input;
  const avg = analyses.length
    ? Math.round(analyses.reduce((a, x) => a + (x.riskScore || 0), 0) / analyses.length)
    : 40;
  
  if (!analyses.length) {
    throw new Error("No analyses provided to generate report.");
  }

  try {
    const client = getClient();
    if (!client) throw new Error("Groq API key is not configured. Please set GROQ_API_KEY.");
    
    const schemaInstructions = `
You MUST return ONLY a valid JSON object matching this structure exactly:
{
  "executiveSummary": "...",
  "threatAssessment": "...",
  "riskScore": 0-100,
  "confidence": 0-1,
  "evidence": ["...", "..."],
  "indicators": ["...", "..."],
  "recommendations": ["...", "..."]
}
`;

    const res = await client.chat.completions.create({
      model: getModel(false),
      messages: [
        {
          role: "system",
          content: `${BASE_SYSTEM}\nYou are compiling a formal fraud investigation report from a set of prior analyses. Produce an executive summary, a threat assessment, an overall risk score (0-100), a confidence (0-1), a bullet list of evidence, key indicators, and recommended actions.\n${schemaInstructions}`
        },
        {
          role: "user",
          content: `Compile an investigation report from these analyses:\n${JSON.stringify(analyses, null, 2)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });
    
    const rawText = res.choices[0]?.message?.content || "";
    let parsed: Partial<InvestigationReport> | null = null;
    
    try {
      parsed = JSON.parse(rawText) as Partial<InvestigationReport>;
    } catch (e) {
      console.error("[groq] json parse failed:", e);
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
    console.error("[groq] report generation failed, falling back to deterministic generation:", err);
    return {
      executiveSummary: "Fallback report generated due to AI service unavailability. " + analyses.length + " analyses were processed.",
      threatAssessment: "Unable to generate detailed threat assessment due to AI unavailability.",
      riskScore: avg,
      confidence: 0.5,
      evidence: [],
      indicators: ["Generated via fallback deterministic engine."],
      recommendations: ["Review individual analyses manually.", "Re-run report generation when AI service is restored."],
    };
  }
}
