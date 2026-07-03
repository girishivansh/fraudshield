import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Report } from "@/models/Report";
import { requireUser } from "@/lib/auth";
import { serializeReport } from "@/lib/serialize";
import { ok, handleError } from "@/lib/api";

/** List the current user's saved reports (optional ?search= & ?type=). */
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") ?? "").trim();
    const type = (searchParams.get("type") ?? "").trim();

    const query: Record<string, unknown> = { userId: user._id };
    if (search) query.title = { $regex: search, $options: "i" };
    if (type && type.toLowerCase() !== "all") query["reportData.category"] = { $regex: `^${type}$`, $options: "i" };

    const reports = await Report.find(query).sort({ createdAt: -1 }).limit(100);
    return ok({ reports: reports.map(serializeReport) });
  } catch (err) {
    return handleError(err);
  }
}
