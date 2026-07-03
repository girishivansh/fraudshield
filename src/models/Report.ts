import mongoose, { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/* A generated investigation report, optionally linked to an analysis. */
const ReportSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    analysisId: { type: Schema.Types.ObjectId, ref: "Analysis", default: null },
    title: { type: String, required: true },
    kind: { type: String, default: "report" },
    risk: { type: Number, default: 0 }, // 0..100
    level: { type: String, default: "safe" },
    reportData: { type: Schema.Types.Mixed, default: {} }, // executive summary, evidence, etc.
    pdfUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export type ReportDoc = InferSchemaType<typeof ReportSchema> & { _id: mongoose.Types.ObjectId };

export const Report: Model<ReportDoc> =
  (models.Report as Model<ReportDoc>) || model<ReportDoc>("Report", ReportSchema);
