import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Report } from "@/models/Report";
import { requireUser } from "@/lib/auth";
import { serializeReport } from "@/lib/serialize";
import { ok, handleError, notFound } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    await connectDB();
    const report = await Report.findOne({ _id: id, userId: user._id });
    if (!report) throw notFound("Report not found.");
    return ok({ report: serializeReport(report) });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    await connectDB();
    const deleted = await Report.findOneAndDelete({ _id: id, userId: user._id });
    if (!deleted) throw notFound("Report not found.");
    return ok({ deleted: true, id });
  } catch (err) {
    return handleError(err);
  }
}
