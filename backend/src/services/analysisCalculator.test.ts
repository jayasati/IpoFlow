import { test } from "node:test";
import assert from "node:assert/strict";
import { Prisma, LedgerType } from "../generated/prisma/client";
import {
  calculateAverages,
  calculateIpoAnalysis,
  calculateMemberAnalysis,
  calculateMonthlyAnalysis,
} from "./analysisCalculator";
import type { AnalysisApplicationInput, AnalysisLedgerEntry } from "./analysisCalculator";

function entry(overrides: Partial<AnalysisLedgerEntry>): AnalysisLedgerEntry {
  return {
    type: LedgerType.MONEY_SENT,
    credit: new Prisma.Decimal(0),
    debit: new Prisma.Decimal(0),
    createdAt: new Date("2026-01-15T00:00:00Z"),
    ipoId: 1,
    ipoCompany: "Acme Ltd",
    memberId: 1,
    memberName: "Asha",
    ...overrides,
  };
}

test("calculateMonthlyAnalysis buckets by month and computes net cash flow / income", () => {
  const entries = [
    entry({ type: LedgerType.MONEY_SENT, credit: new Prisma.Decimal(10000) }),
    entry({
      type: LedgerType.PROFIT,
      credit: new Prisma.Decimal(2000),
      createdAt: new Date("2026-02-10T00:00:00Z"),
    }),
    entry({
      type: LedgerType.COMMISSION,
      debit: new Prisma.Decimal(200),
      createdAt: new Date("2026-02-20T00:00:00Z"),
    }),
  ];

  const result = calculateMonthlyAnalysis(entries);

  assert.equal(result.length, 2);
  assert.equal(result[0].month, "2026-01");
  assert.equal(result[0].cashIn.toString(), "10000");
  assert.equal(result[0].cumulativeCapital.toString(), "10000");
  assert.equal(result[1].month, "2026-02");
  assert.equal(result[1].profit.toString(), "2000");
  assert.equal(result[1].commission.toString(), "200");
  assert.equal(result[1].netIncome.toString(), "1800");
  // No cash movement in Feb, so cumulative capital carries over from Jan.
  assert.equal(result[1].cumulativeCapital.toString(), "10000");
});

test("calculateMonthlyAnalysis nets money returned against money sent for cash flow", () => {
  const entries = [
    entry({ type: LedgerType.MONEY_SENT, credit: new Prisma.Decimal(10000) }),
    entry({ type: LedgerType.MONEY_RETURNED, debit: new Prisma.Decimal(4000) }),
  ];

  const [month] = calculateMonthlyAnalysis(entries);

  assert.equal(month.netCashFlow.toString(), "6000");
  assert.equal(month.cumulativeCapital.toString(), "6000");
});

function application(overrides: Partial<AnalysisApplicationInput>): AnalysisApplicationInput {
  return {
    ipoId: 1,
    ipoCompany: "Acme Ltd",
    shares: 100,
    issuePrice: new Prisma.Decimal(100),
    ...overrides,
  };
}

test("calculateIpoAnalysis computes ROI relative to capital deployed (shares * issue price), sorted best first", () => {
  const applications = [
    application({ ipoId: 1, ipoCompany: "Acme Ltd", shares: 100, issuePrice: new Prisma.Decimal(100) }),
    application({ ipoId: 2, ipoCompany: "Beta Inc", shares: 100, issuePrice: new Prisma.Decimal(100) }),
  ];
  const entries = [
    entry({ ipoId: 1, ipoCompany: "Acme Ltd", type: LedgerType.PROFIT, credit: new Prisma.Decimal(5000) }),
    entry({ ipoId: 2, ipoCompany: "Beta Inc", type: LedgerType.LOSS, debit: new Prisma.Decimal(1000) }),
  ];

  const result = calculateIpoAnalysis(entries, applications);

  assert.equal(result.length, 2);
  assert.equal(result[0].company, "Acme Ltd");
  assert.equal(result[0].capitalDeployed.toString(), "10000");
  assert.equal(result[0].roi.toString(), "50");
  assert.equal(result[1].company, "Beta Inc");
  assert.equal(result[1].roi.toString(), "-10");
});

test("calculateIpoAnalysis still reports capital deployed for an IPO with no ledger activity yet", () => {
  const applications = [application({ ipoId: 1, ipoCompany: "Acme Ltd", shares: 50, issuePrice: new Prisma.Decimal(200) })];

  const result = calculateIpoAnalysis([], applications);

  assert.equal(result.length, 1);
  assert.equal(result[0].capitalDeployed.toString(), "10000");
  assert.equal(result[0].netIncome.toString(), "0");
  assert.equal(result[0].roi.toString(), "0");
});

test("calculateIpoAnalysis ignores ledger entries with no ipoId (pure member wallet movements)", () => {
  const entries = [entry({ ipoId: null, ipoCompany: null, type: LedgerType.MONEY_SENT, credit: new Prisma.Decimal(500) })];

  assert.deepEqual(calculateIpoAnalysis(entries, []), []);
});

test("calculateMemberAnalysis computes wallet balance and outstanding aging, sorted by net income", () => {
  const now = new Date("2026-03-01T00:00:00Z");
  const entries = [
    entry({
      memberId: 1,
      memberName: "Asha",
      type: LedgerType.MONEY_SENT,
      credit: new Prisma.Decimal(10000),
      createdAt: new Date("2026-01-01T00:00:00Z"),
    }),
    entry({
      memberId: 1,
      memberName: "Asha",
      type: LedgerType.PROFIT,
      credit: new Prisma.Decimal(3000),
      createdAt: new Date("2026-01-20T00:00:00Z"),
    }),
    entry({
      memberId: 2,
      memberName: "Rohit",
      type: LedgerType.MONEY_SENT,
      credit: new Prisma.Decimal(5000),
      createdAt: new Date("2026-01-05T00:00:00Z"),
    }),
    entry({
      memberId: 2,
      memberName: "Rohit",
      type: LedgerType.MONEY_RETURNED,
      debit: new Prisma.Decimal(5000),
      createdAt: new Date("2026-01-05T00:00:00Z"),
    }),
  ];

  const result = calculateMemberAnalysis(entries, now);

  assert.equal(result.length, 2);
  assert.equal(result[0].name, "Asha");
  assert.equal(result[0].netIncome.toString(), "3000");
  assert.equal(result[0].walletBalance.toString(), "13000");
  assert.equal(result[0].outstandingDays, 40);

  const rohit = result.find((m) => m.name === "Rohit")!;
  assert.equal(rohit.walletBalance.toString(), "0");
  // Balance is settled, so outstanding aging isn't meaningful even though the entry is old.
  assert.equal(rohit.outstandingDays, 0);
});

test("calculateAverages divides monthly totals by the number of months present", () => {
  const monthly = calculateMonthlyAnalysis([
    entry({ type: LedgerType.MONEY_SENT, credit: new Prisma.Decimal(10000) }),
    entry({
      type: LedgerType.PROFIT,
      credit: new Prisma.Decimal(2000),
      createdAt: new Date("2026-02-10T00:00:00Z"),
    }),
  ]);

  const averages = calculateAverages(monthly);

  assert.equal(averages.avgMonthlyCashIn.toString(), "5000");
  assert.equal(averages.avgMonthlyNetIncome.toString(), "1000");
});

test("calculateAverages returns zeros when there is no ledger activity at all", () => {
  const averages = calculateAverages([]);
  assert.equal(averages.avgMonthlyCashIn.toString(), "0");
  assert.equal(averages.avgMonthlyNetIncome.toString(), "0");
  assert.equal(averages.avgCapitalDeployed.toString(), "0");
});
