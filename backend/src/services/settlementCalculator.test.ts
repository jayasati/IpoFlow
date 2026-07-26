import { test } from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "../generated/prisma/client";
import { calculateSettlement } from "./settlementCalculator";

test("matches docs/examples.md Example 1: profit with 10% commission", () => {
  // 100 shares @ issue price 100 (cost 10000), sold @ 150 (proceeds 15000) -> profit 5000, commission 500.
  const result = calculateSettlement({
    sharesAllotted: 100,
    issuePrice: new Prisma.Decimal("100"),
    sales: [{ shares: 100, sellPrice: new Prisma.Decimal("150") }],
    commissionRate: new Prisma.Decimal("10"),
  });
  assert.equal(result.profitOrLoss.toString(), "5000");
  assert.equal(result.isProfit, true);
  assert.equal(result.commission.toString(), "500");
});

test("matches docs/examples.md Example 2: loss has zero commission", () => {
  // 100 shares @ issue price 100 (cost 10000), sold @ 80 (proceeds 8000) -> loss 2000, commission 0.
  const result = calculateSettlement({
    sharesAllotted: 100,
    issuePrice: new Prisma.Decimal("100"),
    sales: [{ shares: 100, sellPrice: new Prisma.Decimal("80") }],
    commissionRate: new Prisma.Decimal("10"),
  });
  assert.equal(result.profitOrLoss.toString(), "-2000");
  assert.equal(result.isProfit, false);
  assert.equal(result.commission.toString(), "0");
});

test("aggregates multiple sale tranches sold at different prices", () => {
  const result = calculateSettlement({
    sharesAllotted: 100,
    issuePrice: new Prisma.Decimal("100"),
    sales: [
      { shares: 50, sellPrice: new Prisma.Decimal("120") },
      { shares: 50, sellPrice: new Prisma.Decimal("140") },
    ],
    commissionRate: new Prisma.Decimal("10"),
  });
  // proceeds = 50*120 + 50*140 = 13000; cost = 100*100 = 10000; profit = 3000; commission = 300.
  assert.equal(result.proceeds.toString(), "13000");
  assert.equal(result.profitOrLoss.toString(), "3000");
  assert.equal(result.commission.toString(), "300");
});

test("breakeven sale produces zero profit/loss and zero commission", () => {
  const result = calculateSettlement({
    sharesAllotted: 100,
    issuePrice: new Prisma.Decimal("100"),
    sales: [{ shares: 100, sellPrice: new Prisma.Decimal("100") }],
    commissionRate: new Prisma.Decimal("10"),
  });
  assert.equal(result.profitOrLoss.toString(), "0");
  assert.equal(result.isProfit, false);
  assert.equal(result.commission.toString(), "0");
});

test("commission scales with the member's own commission rate", () => {
  const result = calculateSettlement({
    sharesAllotted: 10,
    issuePrice: new Prisma.Decimal("50"),
    sales: [{ shares: 10, sellPrice: new Prisma.Decimal("100") }],
    commissionRate: new Prisma.Decimal("25"),
  });
  // profit = 10 * (100 - 50) = 500; commission = 25% of 500 = 125.
  assert.equal(result.profitOrLoss.toString(), "500");
  assert.equal(result.commission.toString(), "125");
});

test("only shares actually allotted are used as the cost basis, not shares applied for", () => {
  // Applied for more lots than were allotted — cost basis must use the allotted shares only.
  const result = calculateSettlement({
    sharesAllotted: 20,
    issuePrice: new Prisma.Decimal("100"),
    sales: [{ shares: 20, sellPrice: new Prisma.Decimal("110") }],
    commissionRate: new Prisma.Decimal("10"),
  });
  assert.equal(result.costBasis.toString(), "2000");
  assert.equal(result.profitOrLoss.toString(), "200");
});

test("preserves exact decimal precision without floating-point drift", () => {
  // A naive float computation of 3*33.34 - 3*33.33 can drift away from 0.03.
  const result = calculateSettlement({
    sharesAllotted: 3,
    issuePrice: new Prisma.Decimal("33.33"),
    sales: [{ shares: 3, sellPrice: new Prisma.Decimal("33.34") }],
    commissionRate: new Prisma.Decimal("10"),
  });
  assert.equal(result.profitOrLoss.toString(), "0.03");
});

test("no sales recorded yet means zero proceeds and a loss equal to the full cost basis", () => {
  const result = calculateSettlement({
    sharesAllotted: 10,
    issuePrice: new Prisma.Decimal("100"),
    sales: [],
    commissionRate: new Prisma.Decimal("10"),
  });
  assert.equal(result.proceeds.toString(), "0");
  assert.equal(result.profitOrLoss.toString(), "-1000");
  assert.equal(result.commission.toString(), "0");
});
