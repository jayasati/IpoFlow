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
  commission: string;
}

export function createSettlement(applicationId: number): Promise<SettlementOutcome> {
  return apiPost("/settlement", { applicationId });
}
