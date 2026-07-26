import { apiGet } from "./client";
import type { DashboardSummary } from "../types/dashboard";

export function getDashboard(): Promise<DashboardSummary> {
  return apiGet("/dashboard");
}
