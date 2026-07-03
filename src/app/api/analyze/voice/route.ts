import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { requireUser } from "@/lib/auth";
import { analyzeVoice } from "@/lib/ai/claude";
import { runRuleEngine } from "@/lib/ai/rule-engine";
import { uploadBuffer } from "@/lib/cloudinary";
import { sanitize } from "@/lib/validation";
import { serializeAnalysis } from "@/lib/serialize";
import { ok, handleError, badRequest } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(req: NextRequest) {
  try {
    rateLimit(req, "analyze", 30);
    const user = await requireUser();

    const form = await req.formData();
    const file = form.get("file");
    const transcript = sanitize(String(form.get("transcript") ?? ""), 50_000);

    let mediaUrl = "";
    let fileName = "";
    let hosted = false;

    if (file instanceof File) {
      if (file.size > MAX_BYTES) throw badRequest("Audio exceeds the 25 MB limit.");
      fileName = file.name;
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadBuffer(buffer, {
        folder: "fraudshield/voice",
        resourceType: "video", // Cloudinary stores audio under the "video" resource type
        mimeType: file.type || "audio/mpeg",
      });
      mediaUrl = uploaded.hosted ? uploaded.url : "";
      hosted = uploaded.hosted;
    }

    if (!file && !transcript) throw badRequest("Provide an audio file or a transcript.");

    const ruleResult = transcript ? runRuleEngine(transcript) : undefined;
    const ai = await analyzeVoice(transcript, fileName, ruleResult);

    await connectDB();
    const doc = await Analysis.create({
      userId: user._id,
      type: "voice",
      input: transcript ? transcript.slice(0, 4000) : fileName,
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
      title: `Voice Call · ${ai.verdict}`,
      preview: fileName || (transcript ? transcript.slice(0, 120) : "Voice recording"),
      metadata: { mediaUrl, fileName, hosted, transcript: transcript.slice(0, 4000) },
    });

    return ok({ analysis: serializeAnalysis(doc) }, 201);
  } catch (err) {
    return handleError(err);
  }
}
