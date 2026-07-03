import mongoose, { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/* A single fraud analysis (message / email / image / voice / report). */
const IndicatorSchema = new Schema(
  {
    label: { type: String, required: true },
    weight: { type: Number, required: true }, // 0..1
    hit: { type: Boolean, required: true },
    explanation: { type: String, default: "" },
    riskImpact: { type: Number, default: 0 },
  },
  { _id: false }
);

const AnalysisSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["message", "email", "voice", "screenshot", "report"],
    },
    input: { type: String, default: "" }, // raw text, filename, or media URL
    verdict: { type: String, required: true },
    riskScore: { type: Number, required: true }, // 0..100
    confidence: { type: Number, required: true }, // 0..1
    confidenceReasoning: { type: String, default: "" },
    executiveSummary: { type: String, default: "" },
    category: { type: String, default: "Uncategorized" },
    indicators: { type: [IndicatorSchema], default: [] },
    recommendations: { type: [String], default: [] },
    evidence: {
      type: [
        new Schema({
          type: { type: String, required: true },
          value: { type: String, required: true },
        }, { _id: false })
      ],
      default: []
    },
    ocrText: { type: String, default: "" },
    summary: { type: String, default: "" },
    title: { type: String, default: "" },
    preview: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} }, // mediaUrl, transcript, fileName…
  },
  { timestamps: true }
);

export type AnalysisDoc = InferSchemaType<typeof AnalysisSchema> & { _id: mongoose.Types.ObjectId };

export const Analysis: Model<AnalysisDoc> =
  (models.Analysis as Model<AnalysisDoc>) || model<AnalysisDoc>("Analysis", AnalysisSchema);
