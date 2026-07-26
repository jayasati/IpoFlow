import { test } from "node:test";
import assert from "node:assert/strict";
import { Prisma, IpoStatus, LedgerType } from "../generated/prisma/client";
import { calculateDashboard } from "./dashboardCalculator";

function ledgerTotal(type: LedgerType, credit: string, debit: string) {
  return { type, credit: new Prisma.Decimal(credit), debit: new Prisma.Decimal(debit) };
}

test("computes capital used from Money Sent credits only", () => {
  const result = calculateDashboard({
    ledgerTotals: [
      ledgerTotal(LedgerType.MONEY_SENT, "15000", "0"),
      ledgerTotal(LedgerType.MONEY_RETURNED, "0", "12000"),
    ],
    ipoStatusCounts: [],
    memberCount: 0,
  });
  assert.equal(result.capitalUsed.toString(), "15000");
});

test("wallet is total credits minus total debits across every ledger type", () => {
  const result = calculateDashboard({
    ledgerTotals: [
      ledgerTotal(LedgerType.MONEY_SENT, "15000", "0"),
      ledgerTotal(LedgerType.PROFIT, "5000", "0"),
      ledgerTotal(LedgerType.COMMISSION, "0", "500"),
      ledgerTotal(LedgerType.MONEY_RETURNED, "0", "12000"),
    ],
    ipoStatusCounts: [],
    memberCount: 0,
  });
  // Matches docs/examples.md Example 1 exactly: wallet/outstanding = 7500.
  assert.equal(result.wallet.toString(), "7500");
  assert.equal(result.outstanding.toString(), result.wallet.toString());
});

test("profit is Profit minus Loss minus Commission - the operator's true net earnings", () => {
  const result = calculateDashboard({
    ledgerTotals: [
      ledgerTotal(LedgerType.PROFIT, "5000", "0"),
      ledgerTotal(LedgerType.LOSS, "0", "2000"),
      ledgerTotal(LedgerType.COMMISSION, "0", "500"),
    ],
    ipoStatusCounts: [],
    memberCount: 0,
  });
  assert.equal(result.profit.toString(), "2500");
});

test("ROI is profit as a percentage of capital used", () => {
  const result = calculateDashboard({
    ledgerTotals: [
      ledgerTotal(LedgerType.MONEY_SENT, "10000", "0"),
      ledgerTotal(LedgerType.PROFIT, "2500", "0"),
    ],
    ipoStatusCounts: [],
    memberCount: 0,
  });
  assert.equal(result.roi.toString(), "25");
});

test("ROI is zero (not a division error) when no capital has been deployed yet", () => {
  const result = calculateDashboard({
    ledgerTotals: [],
    ipoStatusCounts: [],
    memberCount: 0,
  });
  assert.equal(result.roi.toString(), "0");
});

test("active IPOs excludes only COMPLETE, counting every other status", () => {
  const result = calculateDashboard({
    ledgerTotals: [],
    ipoStatusCounts: [
      { status: IpoStatus.DRAFT, count: 2 },
      { status: IpoStatus.OPEN, count: 1 },
      { status: IpoStatus.SETTLED, count: 3 },
      { status: IpoStatus.COMPLETE, count: 5 },
    ],
    memberCount: 0,
  });
  assert.equal(result.activeIpos, 6);
});

test("passes member count through unchanged", () => {
  const result = calculateDashboard({ ledgerTotals: [], ipoStatusCounts: [], memberCount: 42 });
  assert.equal(result.members, 42);
});

test("charts carry the raw breakdown data through for the frontend to render", () => {
  const ipoStatusCounts = [{ status: IpoStatus.OPEN, count: 4 }];
  const ledgerTotals = [ledgerTotal(LedgerType.MONEY_SENT, "1000", "0")];
  const result = calculateDashboard({ ledgerTotals, ipoStatusCounts, memberCount: 0 });
  assert.deepEqual(result.charts.ipoStatusBreakdown, ipoStatusCounts);
  assert.deepEqual(result.charts.ledgerBreakdown, ledgerTotals);
});

test("a portfolio with no activity yet reports all-zero figures without erroring", () => {
  const result = calculateDashboard({ ledgerTotals: [], ipoStatusCounts: [], memberCount: 0 });
  assert.equal(result.capitalUsed.toString(), "0");
  assert.equal(result.wallet.toString(), "0");
  assert.equal(result.profit.toString(), "0");
  assert.equal(result.roi.toString(), "0");
  assert.equal(result.activeIpos, 0);
});
