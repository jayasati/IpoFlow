import { apiGet } from "./client";
import type { AnalysisSummary } from "../types/analysis";

export function getAnalysis(): Promise<AnalysisSummary> {
  return apiGet("/analysis");
}
