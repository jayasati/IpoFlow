import type { IpoStatus } from "../../types/ipo";

export const IPO_STATUS_ORDER: IpoStatus[] = [
  "DRAFT",
  "OPEN",
  "APPLIED",
  "ALLOTTED",
  "SOLD",
  "SETTLED",
  "COMPLETE",
];

// Ordinal blue ramp, one hue light -> dark: earliest workflow stage lightest, latest darkest.
export const IPO_STATUS_COLORS: Record<IpoStatus, string> = {
  DRAFT: "#86b6ef",
  OPEN: "#6da7ec",
  APPLIED: "#5598e7",
  ALLOTTED: "#3987e5",
  SOLD: "#2a78d6",
  SETTLED: "#256abf",
  COMPLETE: "#1c5cab",
};

export const LEDGER_TYPE_LABELS: Record<string, string> = {
  MONEY_SENT: "Money Sent",
  MONEY_RETURNED: "Money Returned",
  PROFIT: "Profit",
  LOSS: "Loss",
  COMMISSION: "Commission",
  ADJUSTMENT: "Adjustment",
};

// Categorical slots 1 (blue) and 8 (red) - validated pair for credit vs debit.
export const CREDIT_COLOR = "#2a78d6";
export const DEBIT_COLOR = "#e34948";
