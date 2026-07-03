import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { Report } from "@/models/Report";
import { requireUser } from "@/lib/auth";
import { serializeAnalysis, serializeReport } from "@/lib/serialize";
import { ok, handleError } from "@/lib/api";

/** Full investigation history: every analysis + every saved report. */
export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();

    const [analyses, reports] = await Promise.all([
      Analysis.find({ userId: user._id }).sort({ createdAt: -1 }).limit(100),
      Report.find({ userId: user._id }).sort({ createdAt: -1 }).limit(100),
    ]);

    return ok({
      analyses: analyses.map(serializeAnalysis),
      reports: reports.map(serializeReport),
    });
  } catch (err) {
    return handleError(err);
  }
}
