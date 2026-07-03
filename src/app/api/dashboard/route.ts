import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { Report } from "@/models/Report";
import { requireUser } from "@/lib/auth";
import { serializeAnalysis, serializeReport } from "@/lib/serialize";
import { ok, handleError } from "@/lib/api";

const CATEGORY_COLORS = ["#6366F1", "#22D3EE", "#F59E0B", "#F87171", "#34D399", "#A78BFA", "#FB7185"];

export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();
    const uid = user._id;

    const [total, reportsCount, avgAgg, catAgg, recent, monthAgg, savedReports] = await Promise.all([
      Analysis.countDocuments({ userId: uid }),
      Report.countDocuments({ userId: uid }),
      Analysis.aggregate([
        { $match: { userId: uid } },
        {
          $group: {
            _id: null,
            avg: { $avg: "$riskScore" },
            high: { $sum: { $cond: [{ $gte: ["$riskScore", 65] }, 1, 0] } },
          },
        },
      ]),
      Analysis.aggregate([
        { $match: { userId: uid } },
        { $group: { _id: "$category", value: { $sum: 1 } } },
        { $sort: { value: -1 } },
        { $limit: 7 },
      ]),
      Analysis.find({ userId: uid }).sort({ createdAt: -1 }).limit(8),
      Analysis.aggregate([
        { $match: { userId: uid } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            totalAnalyses: { $sum: 1 },
            avgRisk: { $avg: "$riskScore" },
            highRisk: { $sum: { $cond: [{ $gte: ["$riskScore", 65] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
      Report.find({ userId: uid }).sort({ createdAt: -1 }).limit(6),
    ]);

    const averageRiskScore = Math.round(avgAgg[0]?.avg ?? 0);
    const highRisk = avgAgg[0]?.high ?? 0;

    const scamCategories = catAgg.map((c, i) => ({
      name: c._id || "Uncategorized",
      value: c.value,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

    const monthlyTrends = monthAgg.map((m) => ({
      month: m._id,
      totalAnalyses: m.totalAnalyses,
      avgRisk: Math.round(m.avgRisk),
      highRisk: m.highRisk,
    }));

    // Derived personal threat exposure signals.
    const threatExposure = [
      {
        label: "Overall risk exposure",
        value: `${averageRiskScore}/100`,
        tone: averageRiskScore >= 65 ? "danger" : averageRiskScore >= 45 ? "warning" : "success",
        hint: "Average risk across all your analyses",
      },
      {
        label: "High-risk detections",
        value: String(highRisk),
        tone: highRisk > 0 ? "danger" : "success",
        hint: "Cases scoring 65+ that need follow-up",
      },
      {
        label: "Total analyses run",
        value: String(total),
        tone: "primary",
        hint: "Content you have investigated",
      },
      {
        label: "Reports generated",
        value: String(reportsCount),
        tone: "accent",
        hint: "Saved investigation case files",
      },
    ];

    return ok({
      totalAnalyses: total,
      averageRiskScore,
      highRisk,
      reportsCount,
      scamCategories,
      monthlyTrends,
      threatExposure,
      recentActivity: recent.map(serializeAnalysis),
      savedReports: savedReports.map(serializeReport),
    });
  } catch (err) {
    return handleError(err);
  }
}
