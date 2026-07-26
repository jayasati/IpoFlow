import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type {
  CreateMemberInput,
  Member,
  MemberListParams,
  PaginatedResponse,
  UpdateMemberInput,
} from "../types/member";

function buildQuery(params: MemberListParams): string {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.groupId) query.set("groupId", String(params.groupId));
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function listMembers(params: MemberListParams = {}): Promise<PaginatedResponse<Member>> {
  return apiGet(`/members${buildQuery(params)}`);
}

export function getMember(id: number): Promise<Member> {
  return apiGet(`/members/${id}`);
}

export function createMember(input: CreateMemberInput): Promise<Member> {
  return apiPost("/members", input);
}

export function updateMember(id: number, input: UpdateMemberInput): Promise<Member> {
  return apiPut(`/members/${id}`, input);
}

export function deleteMember(id: number): Promise<void> {
  return apiDelete(`/members/${id}`);
}
