import { apiGet, apiPost, apiPut } from "./client";
import type { Application, BulkApplicationItem, BulkApplicationResult } from "../types/application";

export function listApplications(ipoId: number): Promise<{ data: Application[] }> {
  return apiGet(`/applications?ipoId=${ipoId}`);
}

export function listApplicationsByMember(memberId: number): Promise<{ data: Application[] }> {
  return apiGet(`/applications?memberId=${memberId}`);
}

export function bulkCreateApplications(
  ipoId: number,
  applications: BulkApplicationItem[],
): Promise<BulkApplicationResult> {
  return apiPost("/applications/bulk", { ipoId, applications });
}

export function updateAllotment(id: number, shares: number): Promise<Application> {
  return apiPut(`/applications/${id}/allotment`, { shares });
}
