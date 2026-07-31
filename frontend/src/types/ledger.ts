export type LedgerType =
  "MONEY_SENT" | "MONEY_RETURNED" | "PROFIT" | "LOSS" | "COMMISSION" | "ADJUSTMENT";

export interface LedgerEntry {
  id: number;
  memberId: number;
  ipoId: number | null;
  saleId: number | null;
  type: LedgerType;
  credit: string;
  debit: string;
  description: string | null;
  createdAt: string;
}

export interface WalletBalance {
  credit: string;
  debit: string;
  balance: string;
  outstanding: string;
}

export interface RecordMoneyMovementInput {
  amount: number;
  ipoId?: number;
  description?: string;
}

export interface RecordAdjustmentInput extends RecordMoneyMovementInput {
  direction: "credit" | "debit";
}
