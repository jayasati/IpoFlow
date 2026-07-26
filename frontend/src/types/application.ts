import type { Member } from "./member";

export type ApplicationStatus =
  "APPLIED" | "ALLOTTED" | "NOT_ALLOTTED" | "PARTIALLY_SOLD" | "SOLD" | "SETTLED";

export interface Application {
  id: number;
  ipoId: number;
  memberId: number;
  lots: number;
  shares: number;
  commissionRate: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  member: Member;
}

export interface BulkApplicationItem {
  memberId: number;
  lots: number;
}

export interface BulkApplicationResult {
  created: Application[];
  skippedMemberIds: number[];
  createdCount: number;
  skippedCount: number;
}
