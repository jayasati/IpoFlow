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
  netIncome: Prisma.Decimal;
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

function netIncome(bucket: Bucket): Prisma.Decimal {
  return bucket.profit.minus(bucket.loss).minus(bucket.commission);
}

export function calculateMonthlyAnalysis(entries: AnalysisLedgerEntry[]): MonthlyAnalysis[] {
  const buckets = new Map<string, Bucket>();
  for (const entry of entries) {
    const key = monthKey(entry.createdAt);
    const bucket = buckets.get(key) ?? emptyBucket();
    applyEntry(bucket, entry);
    buckets.set(key, bucket);
  }

  let cumulativeCapital = zero();
  return [...buckets.keys()].sort().map((month) => {
    const bucket = buckets.get(month)!;
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
      netIncome: netIncome(bucket),
    };
  });
}

export function calculateIpoAnalysis(
  entries: AnalysisLedgerEntry[],
  applications: AnalysisApplicationInput[],
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

  const ipoIds = new Set([...capitalByIpo.keys(), ...buckets.keys()]);
  return [...ipoIds]
    .map((ipoId) => {
      const capitalRecord = capitalByIpo.get(ipoId);
      const ledgerRecord = buckets.get(ipoId);
      const bucket = ledgerRecord?.bucket ?? emptyBucket();
      const capitalDeployed = capitalRecord?.capital ?? zero();
      const net = netIncome(bucket);
      return {
        ipoId,
        company: capitalRecord?.company ?? ledgerRecord?.company ?? "Unknown",
        capitalDeployed,
        profit: bucket.profit,
        loss: bucket.loss,
        commission: bucket.commission,
        netIncome: net,
        roi: capitalDeployed.isZero() ? zero() : net.dividedBy(capitalDeployed).times(100),
      };
    })
    .sort((a, b) => b.roi.comparedTo(a.roi));
}

export function calculateMemberAnalysis(
  entries: AnalysisLedgerEntry[],
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

  return [...buckets.entries()]
    .map(([memberId, record]) => {
      const walletBalance = record.credit.minus(record.debit);
      const outstandingDays = Math.floor(
        (now.getTime() - record.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        memberId,
        name: record.name,
        capitalSent: record.bucket.cashIn,
        capitalReturned: record.bucket.cashOut,
        profit: record.bucket.profit,
        loss: record.bucket.loss,
        commission: record.bucket.commission,
        netIncome: netIncome(record.bucket),
        walletBalance,
        lastActivityAt: record.lastActivityAt,
        outstandingDays: walletBalance.isZero() ? 0 : outstandingDays,
      };
    })
    .sort((a, b) => b.netIncome.comparedTo(a.netIncome));
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
