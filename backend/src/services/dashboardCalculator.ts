import { Prisma, IpoStatus, LedgerType } from "../generated/prisma/client";
import type { LedgerTypeTotal } from "../repositories/ledger.repository";
import type { IpoStatusCount } from "../repositories/ipo.repository";

export interface DashboardInput {
  ledgerTotals: LedgerTypeTotal[];
  ipoStatusCounts: IpoStatusCount[];
  memberCount: number;
}

export interface DashboardSummary {
  activeIpos: number;
  members: number;
  /** Gross capital ever deployed (sum of Money Sent credits). */
  capitalUsed: Prisma.Decimal;
  /** Aggregate wallet balance across every member: Credits - Debits. */
  wallet: Prisma.Decimal;
  /** Business rule: Outstanding amount = Wallet Balance. */
  outstanding: Prisma.Decimal;
  /** Net operator earnings: Profit - Loss - Commission paid out to members. */
  profit: Prisma.Decimal;
  /** Profit as a percentage of capital deployed. */
  roi: Prisma.Decimal;
  charts: {
    ipoStatusBreakdown: IpoStatusCount[];
    ledgerBreakdown: LedgerTypeTotal[];
  };
}

function findTotal(
  totals: LedgerTypeTotal[],
  type: LedgerType,
): { credit: Prisma.Decimal; debit: Prisma.Decimal } {
  const found = totals.find((total) => total.type === type);
  return {
    credit: found?.credit ?? new Prisma.Decimal(0),
    debit: found?.debit ?? new Prisma.Decimal(0),
  };
}

export function calculateDashboard(input: DashboardInput): DashboardSummary {
  const totalCredit = input.ledgerTotals.reduce(
    (sum, total) => sum.plus(total.credit),
    new Prisma.Decimal(0),
  );
  const totalDebit = input.ledgerTotals.reduce(
    (sum, total) => sum.plus(total.debit),
    new Prisma.Decimal(0),
  );
  const wallet = totalCredit.minus(totalDebit);

  const capitalUsed = findTotal(input.ledgerTotals, LedgerType.MONEY_SENT).credit;
  const profitCredit = findTotal(input.ledgerTotals, LedgerType.PROFIT).credit;
  const lossDebit = findTotal(input.ledgerTotals, LedgerType.LOSS).debit;
  const commissionDebit = findTotal(input.ledgerTotals, LedgerType.COMMISSION).debit;
  const profit = profitCredit.minus(lossDebit).minus(commissionDebit);

  const roi = capitalUsed.isZero()
    ? new Prisma.Decimal(0)
    : profit.dividedBy(capitalUsed).times(100);

  const activeIpos = input.ipoStatusCounts
    .filter((entry) => entry.status !== IpoStatus.COMPLETE)
    .reduce((sum, entry) => sum + entry.count, 0);

  return {
    activeIpos,
    members: input.memberCount,
    capitalUsed,
    wallet,
    outstanding: wallet,
    profit,
    roi,
    charts: {
      ipoStatusBreakdown: input.ipoStatusCounts,
      ledgerBreakdown: input.ledgerTotals,
    },
  };
}
