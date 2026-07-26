import type { Member } from "./member";

export interface ParticipantGroupMember {
  id: number;
  groupId: number;
  memberId: number;
  member: Member;
}

export interface ParticipantGroup {
  id: number;
  name: string;
  isDefault: boolean;
  createdAt: string;
  members: ParticipantGroupMember[];
}

export interface CreateGroupInput {
  name: string;
  isDefault?: boolean;
  memberIds?: number[];
}

export interface UpdateGroupInput {
  name?: string;
  isDefault?: boolean;
}
