import type { IpoStatus } from "./ipo";
// Re-exported for backward compatibility — the canonical definition now lives in ./ledger.
export type { LedgerType } from "./ledger";
import type { LedgerType } from "./ledger";

export interface IpoStatusCount {
  status: IpoStatus;
  count: number;
}

export interface LedgerTypeTotal {
  type: LedgerType;
  credit: string;
  debit: string;
}

export interface DashboardSummary {
  activeIpos: number;
  members: number;
  capitalUsed: string;
  wallet: string;
  outstanding: string;
  profit: string;
  roi: string;
  charts: {
    ipoStatusBreakdown: IpoStatusCount[];
    ledgerBreakdown: LedgerTypeTotal[];
  };
}
