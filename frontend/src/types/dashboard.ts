import type { IpoStatus } from "./ipo";

export type LedgerType =
  "MONEY_SENT" | "MONEY_RETURNED" | "PROFIT" | "LOSS" | "COMMISSION" | "ADJUSTMENT";

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
