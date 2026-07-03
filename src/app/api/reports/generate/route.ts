import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { Report } from "@/models/Report";
import { requireUser } from "@/lib/auth";
import { generateInvestigationReport } from "@/lib/ai/claude";
import { generateReportPdf } from "@/lib/pdf";
import { uploadBuffer } from "@/lib/cloudinary";
import { reportSchema } from "@/lib/validation";
import { serializeAnalysis, serializeReport } from "@/lib/serialize";
import { riskLevel } from "@/lib/utils";
import { ok, handleError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    rateLimit(req, "report", 20);
    const user = await requireUser();
    const { analysisId, title } = reportSchema.parse(await req.json().catch(() => ({})));

    await connectDB();

    // Gather the source analyses for the report.
    let sources;
    let snapshot = null;
    if (analysisId) {
      const one = await Analysis.findOne({ _id: analysisId, userId: user._id });
      if (one) {
        snapshot = serializeAnalysis(one);
        sources = [one];
      }
    }
    if (!sources) {
      sources = await Analysis.find({ userId: user._id }).sort({ createdAt: -1 }).limit(12);
      if (sources.length === 1) snapshot = serializeAnalysis(sources[0]);
    }

    const report = await generateInvestigationReport({
      analyses: sources.map((a) => ({
        type: a.type,
        verdict: a.verdict,
        riskScore: a.riskScore,
        category: a.category ?? "Uncategorized",
        summary: a.summary ?? "",
      })),
      title,
    });

    const level = riskLevel(report.riskScore);
    const reportTitle = title || snapshot?.title || `Investigation report · ${new Date().toISOString().slice(0, 10)}`;
    const category = snapshot?.category || report.indicators[0] || "Investigation";

    // Persist first so the PDF can carry the real report id.
    const doc = await Report.create({
      userId: user._id,
      analysisId: analysisId || null,
      title: reportTitle,
      kind: snapshot?.kind || "report",
      risk: report.riskScore,
      level,
      reportData: { report, analysisSnapshot: snapshot, analyst: user.name, category },
    });

    // Generate the PDF and (best-effort) host it on Cloudinary.
    const pdfBytes = await generateReportPdf(report, {
      id: String(doc._id),
      title: reportTitle,
      analyst: user.name,
      generatedAt: new Date(),
      riskLevel: level,
    });
    const sizeKb = `${Math.max(1, Math.round(pdfBytes.byteLength / 1024))} KB`;

    let pdfUrl = "";
    try {
      const uploaded = await uploadBuffer(Buffer.from(pdfBytes), {
        folder: "fraudshield/reports",
        resourceType: "raw",
        mimeType: "application/pdf",
      });
      if (uploaded.hosted) pdfUrl = uploaded.url;
    } catch (e) {
      console.error("[reports] PDF upload skipped:", e);
    }

    doc.pdfUrl = pdfUrl;
    doc.set("reportData", { ...(doc.reportData as object), size: sizeKb });
    await doc.save();

    return ok({ report: serializeReport(doc) }, 201);
  } catch (err) {
    return handleError(err);
  }
}
