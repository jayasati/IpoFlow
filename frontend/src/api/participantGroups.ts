import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type {
  CreateGroupInput,
  ParticipantGroup,
  UpdateGroupInput,
} from "../types/participantGroup";

export function listGroups(search?: string): Promise<{ data: ParticipantGroup[] }> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiGet(`/groups${qs}`);
}

export function getGroup(id: number): Promise<ParticipantGroup> {
  return apiGet(`/groups/${id}`);
}

export function createGroup(input: CreateGroupInput): Promise<ParticipantGroup> {
  return apiPost("/groups", input);
}

export function updateGroup(id: number, input: UpdateGroupInput): Promise<ParticipantGroup> {
  return apiPut(`/groups/${id}`, input);
}

export function deleteGroup(id: number): Promise<void> {
  return apiDelete(`/groups/${id}`);
}

export function setGroupMembers(id: number, memberIds: number[]): Promise<ParticipantGroup> {
  return apiPut(`/groups/${id}/members`, { memberIds });
}
