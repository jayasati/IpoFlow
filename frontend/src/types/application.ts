import type { Ipo } from "./ipo";
import type { Member } from "./member";

export type ApplicationStatus =
  "APPLIED" | "ALLOTTED" | "NOT_ALLOTTED" | "PARTIALLY_SOLD" | "SOLD" | "SETTLED";

export type FundingSource = "OPERATOR" | "SELF";

export interface Application {
  id: number;
  ipoId: number;
  memberId: number;
  lots: number;
  shares: number;
  commissionRate: string | null;
  status: ApplicationStatus;
  fundingSource: FundingSource;
  /** Informational only, set once a SELF-funded application settles. Never affects the member's wallet. */
  memberProfitOrLoss: string | null;
  createdAt: string;
  updatedAt: string;
  /** Present when fetched via GET /applications?ipoId= or by application id. */
  member?: Member;
  /** Present when fetched via GET /applications?memberId= or by application id. */
  ipo?: Ipo;
}

export interface BulkApplicationItem {
  memberId: number;
  lots: number;
  fundingSource?: FundingSource;
}

export interface BulkApplicationResult {
  created: Application[];
  skippedMemberIds: number[];
  createdCount: number;
  skippedCount: number;
}
