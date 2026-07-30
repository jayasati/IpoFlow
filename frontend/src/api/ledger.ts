import { apiGet, apiPost } from "./client";
import type { PaginatedResponse } from "../types/pagination";
import type { LedgerEntry, RecordMoneyMovementInput, WalletBalance } from "../types/ledger";

export function getWallet(memberId: number): Promise<WalletBalance> {
  return apiGet(`/members/${memberId}/wallet`);
}

export function getLedger(
  memberId: number,
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<LedgerEntry> & { wallet: WalletBalance }> {
  return apiGet(`/members/${memberId}/ledger?page=${page}&pageSize=${pageSize}`);
}

export function recordMoneySent(
  memberId: number,
  input: RecordMoneyMovementInput,
): Promise<LedgerEntry> {
  return apiPost(`/members/${memberId}/ledger/money-sent`, input);
}

export function recordMoneyReturned(
  memberId: number,
  input: RecordMoneyMovementInput,
): Promise<LedgerEntry> {
  return apiPost(`/members/${memberId}/ledger/money-returned`, input);
}

export function recordCommission(
  memberId: number,
  input: RecordMoneyMovementInput,
): Promise<LedgerEntry> {
  return apiPost(`/members/${memberId}/ledger/commission`, input);
}
