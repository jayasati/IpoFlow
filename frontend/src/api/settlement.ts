import { apiPost } from "./client";
import type { Application } from "../types/application";
import type { LedgerEntry } from "../types/ledger";

export interface SettlementOutcome {
  application: Application;
  ledgerEntries: LedgerEntry[];
  proceeds: string;
  costBasis: string;
  profitOrLoss: string;
  isProfit: boolean;
}

export function createSettlement(
  applicationId: number,
  operatorAmount?: number,
): Promise<SettlementOutcome> {
  return apiPost("/settlement", { applicationId, operatorAmount });
}
