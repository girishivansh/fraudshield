import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { requireUser } from "@/lib/auth";
import { analyzeImage } from "@/lib/ai/claude";
import { runRuleEngine } from "@/lib/ai/rule-engine";
import { uploadBuffer } from "@/lib/cloudinary";
import { serializeAnalysis } from "@/lib/serialize";
import { ok, handleError, badRequest } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

export async function POST(req: NextRequest) {
  try {
    rateLimit(req, "analyze", 30);
    const user = await requireUser();

    const form = await req.formData();
    const file = form.get("file");
    const note = String(form.get("note") ?? "");

    if (!(file instanceof File)) throw badRequest("An image file is required.");
    if (file.size > MAX_BYTES) throw badRequest("Image exceeds the 15 MB limit.");
    if (!file.type.startsWith("image/")) throw badRequest("File must be an image.");

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, hosted } = await uploadBuffer(buffer, {
      folder: "fraudshield/screenshots",
      resourceType: "image",
      mimeType: file.type,
    });

    const ruleResult = note ? runRuleEngine(note) : undefined;
    const ai = await analyzeImage(url, note, ruleResult);

    await connectDB();
    const doc = await Analysis.create({
      userId: user._id,
      type: "screenshot",
      input: hosted ? url : file.name,
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
      title: `Screenshot · ${ai.verdict}`,
      preview: file.name || "Uploaded screenshot",
      metadata: { mediaUrl: hosted ? url : "", fileName: file.name, hosted },
    });

    return ok({ analysis: serializeAnalysis(doc) }, 201);
  } catch (err) {
    return handleError(err);
  }
}
