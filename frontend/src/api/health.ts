import { apiGet } from "./client";

export interface HealthStatus {
  status: string;
  timestamp: string;
}

export function getHealth(): Promise<HealthStatus> {
  return apiGet<HealthStatus>("/health");
}
