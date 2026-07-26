import { Prisma } from "../generated/prisma/client";

export interface SettlementSaleInput {
  shares: number;
  sellPrice: Prisma.Decimal;
}

export interface SettlementInput {
  sharesAllotted: number;
  issuePrice: Prisma.Decimal;
  sales: SettlementSaleInput[];
  commissionRate: Prisma.Decimal;
}

export interface SettlementResult {
  proceeds: Prisma.Decimal;
  costBasis: Prisma.Decimal;
  /** Profit (positive) or Loss (negative). Wallet credit on profit, debit on loss. */
  profitOrLoss: Prisma.Decimal;
  isProfit: boolean;
  /** Business rule: commission is only charged on profit; loss has zero commission. */
  commission: Prisma.Decimal;
}

export function calculateSettlement(input: SettlementInput): SettlementResult {
  const proceeds = input.sales.reduce(
    (sum, sale) => sum.plus(sale.sellPrice.times(sale.shares)),
    new Prisma.Decimal(0),
  );
  const costBasis = input.issuePrice.times(input.sharesAllotted);
  const profitOrLoss = proceeds.minus(costBasis);
  const isProfit = profitOrLoss.greaterThan(0);
  const commission = isProfit
    ? profitOrLoss.times(input.commissionRate).dividedBy(100)
    : new Prisma.Decimal(0);

  return { proceeds, costBasis, profitOrLoss, isProfit, commission };
}
