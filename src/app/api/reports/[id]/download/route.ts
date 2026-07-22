import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Report } from "@/models/Report";
import { requireUser } from "@/lib/auth";
import { generateReportPdf } from "@/lib/pdf";
import { handleError, notFound } from "@/lib/api";
import type { InvestigationReport } from "@/lib/ai/groq";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Stream the report as a freshly-rendered PDF attachment. */
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    await connectDB();

    const doc = await Report.findOne({ _id: id, userId: user._id });
    if (!doc) throw notFound("Report not found.");

    const data = (doc.reportData ?? {}) as Record<string, unknown>;
    const report = (data.report ?? {}) as InvestigationReport;

    const pdfBytes = await generateReportPdf(
      {
        executiveSummary: report.executiveSummary ?? "",
        threatAssessment: report.threatAssessment ?? "",
        riskScore: report.riskScore ?? doc.risk ?? 0,
        confidence: report.confidence ?? 0.9,
        evidence: report.evidence ?? [],
        indicators: report.indicators ?? [],
        recommendations: report.recommendations ?? [],
      },
      {
        id: String(doc._id),
        title: doc.title,
        analyst: (data.analyst as string) || user.name,
        generatedAt: (doc as unknown as { createdAt?: Date }).createdAt ?? new Date(),
        riskLevel: doc.level ?? "safe",
      }
    );

    const fileName = `${String(doc._id).slice(-6)}-fraudshield-report.pdf`;
    return new Response(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
