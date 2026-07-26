import { apiGet, apiPost } from "./client";
import type { Application, BulkApplicationItem, BulkApplicationResult } from "../types/application";

export function listApplications(ipoId: number): Promise<{ data: Application[] }> {
  return apiGet(`/applications?ipoId=${ipoId}`);
}

export function bulkCreateApplications(
  ipoId: number,
  applications: BulkApplicationItem[],
): Promise<BulkApplicationResult> {
  return apiPost("/applications/bulk", { ipoId, applications });
}
