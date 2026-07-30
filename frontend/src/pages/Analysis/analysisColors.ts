// Reuses the app's validated categorical order (slot 1 blue, slot 8 red) and the
// fixed status palette — see frontend/src/pages/Dashboard/dashboardColors.ts.
export const CASH_IN_COLOR = "#2a78d6";
export const CASH_OUT_COLOR = "#e34948";
export const COMMISSION_COLOR = "#eb6834";

export const GOOD_COLOR = "#0ca30c";
export const CRITICAL_COLOR = "#d03b3b";

export function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split("-");
  const date = new Date(Number(year), Number(monthNum) - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}
