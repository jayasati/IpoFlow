import { Prisma } from "../generated/prisma/client";

export interface SettlementSaleInput {
  shares: number;
  sellPrice: Prisma.Decimal;
  /** Actual amount credited after taxes/charges; overrides shares * sellPrice when present. */
  netAmount?: Prisma.Decimal | null;
}

export interface SettlementInput {
  sharesAllotted: number;
  issuePrice: Prisma.Decimal;
  sales: SettlementSaleInput[];
}

export interface SettlementResult {
  proceeds: Prisma.Decimal;
  costBasis: Prisma.Decimal;
  /** Profit (positive) or Loss (negative). Wallet credit on profit, debit on loss. */
  profitOrLoss: Prisma.Decimal;
  isProfit: boolean;
}

// Commission is no longer computed automatically here — the operator records it
// manually per member (see ledgerService.recordCommission) since it's paid at their
// discretion rather than derived as a fixed percentage of profit.
export function calculateSettlement(input: SettlementInput): SettlementResult {
  const proceeds = input.sales.reduce(
    (sum, sale) => sum.plus(sale.netAmount ?? sale.sellPrice.times(sale.shares)),
    new Prisma.Decimal(0),
  );
  const costBasis = input.issuePrice.times(input.sharesAllotted);
  const profitOrLoss = proceeds.minus(costBasis);
  const isProfit = profitOrLoss.greaterThan(0);

  return { proceeds, costBasis, profitOrLoss, isProfit };
}
