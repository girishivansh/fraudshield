import type { Analysis, AnalysisKind } from "./analysis";

export type { Analysis, AnalysisKind } from "./analysis";

/** A report the user generated and saved from an analysis. */
export type SavedReport = {
  id: string;
  title: string;
  kind: AnalysisKind;
  risk: number;
  level: Analysis["level"];
  date: string; // YYYY-MM-DD
  createdAt: number;
  /** the analysis this report was compiled from (for re-download) */
  source: Analysis;
};
