import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { requireUser } from "@/lib/auth";
import { analyzeMessage } from "@/lib/ai/claude";
import { runRuleEngine } from "@/lib/ai/rule-engine";
import { messageSchema, sanitize } from "@/lib/validation";
import { serializeAnalysis } from "@/lib/serialize";
import { ok, handleError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    rateLimit(req, "analyze", 40);
    const user = await requireUser();
    const { input } = messageSchema.parse(await req.json());
    const clean = sanitize(input);

    const ruleResult = runRuleEngine(clean);
    const ai = await analyzeMessage(clean, ruleResult);
    
    await connectDB();
    const doc = await Analysis.create({
      userId: user._id,
      type: "message",
      input: clean.slice(0, 4000),
      verdict: ai.verdict,
      riskScore: ai.riskScore,
      confidence: ai.confidence,
      confidenceReasoning: ai.confidenceReasoning,
      executiveSummary: ai.executiveSummary,
      evidence: ai.evidence,
      ocrText: ai.ocrText,
      category: ai.category,
      indicators: ai.indicators,
      recommendations: ai.recommendations,
      summary: ai.summary,
      title: `Scam Message · ${ai.verdict}`,
      preview: clean.slice(0, 120) || "—",
    });

    return ok({ analysis: serializeAnalysis(doc) }, 201);
  } catch (err) {
    return handleError(err);
  }
}
