import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type { PaginatedResponse } from "../types/pagination";
import type { CreateIpoInput, Ipo, IpoListParams, IpoStatus, UpdateIpoInput } from "../types/ipo";

function buildQuery(params: IpoListParams): string {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function listIpos(params: IpoListParams = {}): Promise<PaginatedResponse<Ipo>> {
  return apiGet(`/ipos${buildQuery(params)}`);
}

export function getIpo(id: number): Promise<Ipo> {
  return apiGet(`/ipos/${id}`);
}

export function createIpo(input: CreateIpoInput): Promise<Ipo> {
  return apiPost("/ipos", input);
}

export function updateIpo(id: number, input: UpdateIpoInput): Promise<Ipo> {
  return apiPut(`/ipos/${id}`, input);
}

export function deleteIpo(id: number): Promise<void> {
  return apiDelete(`/ipos/${id}`);
}

export function updateIpoStatus(id: number, status: IpoStatus): Promise<Ipo> {
  return apiPut(`/ipos/${id}/status`, { status });
}

export function cloneIpo(id: number): Promise<Ipo> {
  return apiPost(`/ipos/${id}/clone`);
}
