import { LedgerType, Prisma } from "../generated/prisma/client";

export interface AnalysisLedgerEntry {
  type: LedgerType;
  credit: Prisma.Decimal;
  debit: Prisma.Decimal;
  createdAt: Date;
  ipoId: number | null;
  ipoCompany: string | null;
  memberId: number;
  memberName: string;
}

/** The operator's own account — cuts/compensation on SELF-funded settlements.
 * Separate from the Ledger entirely, since this money was never pooled. */
export interface AnalysisOperatorTransaction {
  memberId: number;
  memberName: string;
  ipoId: number;
  credit: Prisma.Decimal;
  debit: Prisma.Decimal;
  createdAt: Date;
}

export interface MonthlyAnalysis {
  month: string;
  cashIn: Prisma.Decimal;
  cashOut: Prisma.Decimal;
  netCashFlow: Prisma.Decimal;
  /** Running cashIn - cashOut across every month up to and including this one. */
  cumulativeCapital: Prisma.Decimal;
  profit: Prisma.Decimal;
  loss: Prisma.Decimal;
  commission: Prisma.Decimal;
  /** Cuts taken minus compensation paid on SELF-funded settlements this month. */
  operatorNet: Prisma.Decimal;
  netIncome: Prisma.Decimal;
}

export interface AnalysisApplicationInput {
  ipoId: number;
  ipoCompany: string;
  shares: number;
  issuePrice: Prisma.Decimal;
}

export interface IpoAnalysis {
  ipoId: number;
  company: string;
  capitalDeployed: Prisma.Decimal;
  profit: Prisma.Decimal;
  loss: Prisma.Decimal;
  commission: Prisma.Decimal;
  /** Cuts taken minus compensation paid on this IPO's SELF-funded settlements. */
  operatorNet: Prisma.Decimal;
  netIncome: Prisma.Decimal;
  /** netIncome as a percentage of capitalDeployed. */
  roi: Prisma.Decimal;
}

export interface MemberAnalysis {
  memberId: number;
  name: string;
  capitalSent: Prisma.Decimal;
  capitalReturned: Prisma.Decimal;
  profit: Prisma.Decimal;
  loss: Prisma.Decimal;
  commission: Prisma.Decimal;
  /** Wallet-affecting net (Profit - Loss - Commission from the Ledger only). */
  netIncome: Prisma.Decimal;
  /** What the operator earned (or paid out) from this member's SELF-funded deals. */
  yourCut: Prisma.Decimal;
  /** The operator's total profit from this member after commission, across both funding
   * types: netIncome (pooled-capital) + yourCut (self-funded). Not the member's own
   * trading profit -- see the member's own page for that. */
  totalProfit: Prisma.Decimal;
  /** Credits - debits across every ledger entry for this member. */
  walletBalance: Prisma.Decimal;
  lastActivityAt: Date;
  /** Days since the member's last ledger entry; only meaningful while walletBalance is non-zero. */
  outstandingDays: number;
}

export interface AnalysisAverages {
  avgMonthlyCashIn: Prisma.Decimal;
  avgMonthlyNetIncome: Prisma.Decimal;
  avgCapitalDeployed: Prisma.Decimal;
}

interface Bucket {
  cashIn: Prisma.Decimal;
  cashOut: Prisma.Decimal;
  profit: Prisma.Decimal;
  loss: Prisma.Decimal;
  commission: Prisma.Decimal;
}

function zero(): Prisma.Decimal {
  return new Prisma.Decimal(0);
}

function emptyBucket(): Bucket {
  return { cashIn: zero(), cashOut: zero(), profit: zero(), loss: zero(), commission: zero() };
}

function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

function applyEntry(bucket: Bucket, entry: AnalysisLedgerEntry): void {
  switch (entry.type) {
    case LedgerType.MONEY_SENT:
      bucket.cashIn = bucket.cashIn.plus(entry.credit);
      break;
    case LedgerType.MONEY_RETURNED:
      bucket.cashOut = bucket.cashOut.plus(entry.debit);
      break;
    case LedgerType.PROFIT:
      bucket.profit = bucket.profit.plus(entry.credit);
      break;
    case LedgerType.LOSS:
      bucket.loss = bucket.loss.plus(entry.debit);
      break;
    case LedgerType.COMMISSION:
      bucket.commission = bucket.commission.plus(entry.debit);
      break;
    case LedgerType.ADJUSTMENT:
      // Freeform correction — fold into cash in/out so totals still reconcile with wallet balance.
      bucket.cashIn = bucket.cashIn.plus(entry.credit);
      bucket.cashOut = bucket.cashOut.plus(entry.debit);
      break;
  }
}

function ledgerNetIncome(bucket: Bucket): Prisma.Decimal {
  return bucket.profit.minus(bucket.loss).minus(bucket.commission);
}

function operatorNetOf(tx: AnalysisOperatorTransaction): Prisma.Decimal {
  return tx.credit.minus(tx.debit);
}

export function calculateMonthlyAnalysis(
  entries: AnalysisLedgerEntry[],
  operatorTransactions: AnalysisOperatorTransaction[],
): MonthlyAnalysis[] {
  const buckets = new Map<string, Bucket>();
  for (const entry of entries) {
    const key = monthKey(entry.createdAt);
    const bucket = buckets.get(key) ?? emptyBucket();
    applyEntry(bucket, entry);
    buckets.set(key, bucket);
  }

  const operatorNetByMonth = new Map<string, Prisma.Decimal>();
  for (const tx of operatorTransactions) {
    const key = monthKey(tx.createdAt);
    operatorNetByMonth.set(key, (operatorNetByMonth.get(key) ?? zero()).plus(operatorNetOf(tx)));
  }

  const months = new Set([...buckets.keys(), ...operatorNetByMonth.keys()]);
  let cumulativeCapital = zero();
  return [...months].sort().map((month) => {
    const bucket = buckets.get(month) ?? emptyBucket();
    const operatorNet = operatorNetByMonth.get(month) ?? zero();
    cumulativeCapital = cumulativeCapital.plus(bucket.cashIn).minus(bucket.cashOut);
    return {
      month,
      cashIn: bucket.cashIn,
      cashOut: bucket.cashOut,
      netCashFlow: bucket.cashIn.minus(bucket.cashOut),
      cumulativeCapital,
      profit: bucket.profit,
      loss: bucket.loss,
      commission: bucket.commission,
      operatorNet,
      netIncome: ledgerNetIncome(bucket).plus(operatorNet),
    };
  });
}

export function calculateIpoAnalysis(
  entries: AnalysisLedgerEntry[],
  applications: AnalysisApplicationInput[],
  operatorTransactions: AnalysisOperatorTransaction[],
): IpoAnalysis[] {
  const capitalByIpo = new Map<number, { company: string; capital: Prisma.Decimal }>();
  for (const app of applications) {
    const record = capitalByIpo.get(app.ipoId) ?? { company: app.ipoCompany, capital: zero() };
    record.capital = record.capital.plus(app.issuePrice.times(app.shares));
    capitalByIpo.set(app.ipoId, record);
  }

  const buckets = new Map<number, { company: string; bucket: Bucket }>();
  for (const entry of entries) {
    if (entry.ipoId == null) continue;
    const record = buckets.get(entry.ipoId) ?? {
      company: entry.ipoCompany ?? "Unknown",
      bucket: emptyBucket(),
    };
    applyEntry(record.bucket, entry);
    buckets.set(entry.ipoId, record);
  }

  const operatorNetByIpo = new Map<number, Prisma.Decimal>();
  for (const tx of operatorTransactions) {
    operatorNetByIpo.set(tx.ipoId, (operatorNetByIpo.get(tx.ipoId) ?? zero()).plus(operatorNetOf(tx)));
  }

  const ipoIds = new Set([...capitalByIpo.keys(), ...buckets.keys(), ...operatorNetByIpo.keys()]);
  return [...ipoIds]
    .map((ipoId) => {
      const capitalRecord = capitalByIpo.get(ipoId);
      const ledgerRecord = buckets.get(ipoId);
      const bucket = ledgerRecord?.bucket ?? emptyBucket();
      const capitalDeployed = capitalRecord?.capital ?? zero();
      const operatorNet = operatorNetByIpo.get(ipoId) ?? zero();
      const net = ledgerNetIncome(bucket).plus(operatorNet);
      return {
        ipoId,
        company: capitalRecord?.company ?? ledgerRecord?.company ?? "Unknown",
        capitalDeployed,
        profit: bucket.profit,
        loss: bucket.loss,
        commission: bucket.commission,
        operatorNet,
        netIncome: net,
        roi: capitalDeployed.isZero() ? zero() : net.dividedBy(capitalDeployed).times(100),
      };
    })
    .sort((a, b) => b.roi.comparedTo(a.roi));
}

export function calculateMemberAnalysis(
  entries: AnalysisLedgerEntry[],
  operatorTransactions: AnalysisOperatorTransaction[],
  now: Date,
): MemberAnalysis[] {
  const buckets = new Map<
    number,
    { name: string; bucket: Bucket; credit: Prisma.Decimal; debit: Prisma.Decimal; lastActivityAt: Date }
  >();
  for (const entry of entries) {
    const record = buckets.get(entry.memberId) ?? {
      name: entry.memberName,
      bucket: emptyBucket(),
      credit: zero(),
      debit: zero(),
      lastActivityAt: entry.createdAt,
    };
    applyEntry(record.bucket, entry);
    record.credit = record.credit.plus(entry.credit);
    record.debit = record.debit.plus(entry.debit);
    if (entry.createdAt > record.lastActivityAt) {
      record.lastActivityAt = entry.createdAt;
    }
    buckets.set(entry.memberId, record);
  }

  const namesByMember = new Map<number, string>();

  const yourCutByMember = new Map<number, Prisma.Decimal>();
  for (const tx of operatorTransactions) {
    yourCutByMember.set(tx.memberId, (yourCutByMember.get(tx.memberId) ?? zero()).plus(operatorNetOf(tx)));
    namesByMember.set(tx.memberId, tx.memberName);
  }

  const memberIds = new Set([...buckets.keys(), ...yourCutByMember.keys()]);

  return [...memberIds]
    .map((memberId) => {
      const record = buckets.get(memberId);
      const bucket = record?.bucket ?? emptyBucket();
      const walletBalance = record ? record.credit.minus(record.debit) : zero();
      const lastActivityAt = record?.lastActivityAt ?? now;
      const outstandingDays = Math.floor(
        (now.getTime() - lastActivityAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      const netIncome = ledgerNetIncome(bucket);
      const yourCut = yourCutByMember.get(memberId) ?? zero();
      return {
        memberId,
        name: record?.name ?? namesByMember.get(memberId) ?? "Unknown",
        capitalSent: bucket.cashIn,
        capitalReturned: bucket.cashOut,
        profit: bucket.profit,
        loss: bucket.loss,
        commission: bucket.commission,
        netIncome,
        yourCut,
        totalProfit: netIncome.plus(yourCut),
        walletBalance,
        lastActivityAt,
        outstandingDays: walletBalance.isZero() ? 0 : outstandingDays,
      };
    })
    .sort((a, b) => b.totalProfit.comparedTo(a.totalProfit));
}

export function calculateAverages(monthly: MonthlyAnalysis[]): AnalysisAverages {
  if (monthly.length === 0) {
    return { avgMonthlyCashIn: zero(), avgMonthlyNetIncome: zero(), avgCapitalDeployed: zero() };
  }

  const count = new Prisma.Decimal(monthly.length);
  const totalCashIn = monthly.reduce((sum, m) => sum.plus(m.cashIn), zero());
  const totalNetIncome = monthly.reduce((sum, m) => sum.plus(m.netIncome), zero());
  const totalCapital = monthly.reduce((sum, m) => sum.plus(m.cumulativeCapital), zero());

  return {
    avgMonthlyCashIn: totalCashIn.dividedBy(count),
    avgMonthlyNetIncome: totalNetIncome.dividedBy(count),
    avgCapitalDeployed: totalCapital.dividedBy(count),
  };
}
