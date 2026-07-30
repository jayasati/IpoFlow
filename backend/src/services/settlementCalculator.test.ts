import { test } from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "../generated/prisma/client";
import { calculateSettlement } from "./settlementCalculator";

test("matches docs/examples.md Example 1: profit", () => {
  // 100 shares @ issue price 100 (cost 10000), sold @ 150 (proceeds 15000) -> profit 5000.
  const result = calculateSettlement({
    sharesAllotted: 100,
    issuePrice: new Prisma.Decimal("100"),
    sales: [{ shares: 100, sellPrice: new Prisma.Decimal("150") }],
  });
  assert.equal(result.profitOrLoss.toString(), "5000");
  assert.equal(result.isProfit, true);
});

test("matches docs/examples.md Example 2: loss", () => {
  // 100 shares @ issue price 100 (cost 10000), sold @ 80 (proceeds 8000) -> loss 2000.
  const result = calculateSettlement({
    sharesAllotted: 100,
    issuePrice: new Prisma.Decimal("100"),
    sales: [{ shares: 100, sellPrice: new Prisma.Decimal("80") }],
  });
  assert.equal(result.profitOrLoss.toString(), "-2000");
  assert.equal(result.isProfit, false);
});

test("aggregates multiple sale tranches sold at different prices", () => {
  const result = calculateSettlement({
    sharesAllotted: 100,
    issuePrice: new Prisma.Decimal("100"),
    sales: [
      { shares: 50, sellPrice: new Prisma.Decimal("120") },
      { shares: 50, sellPrice: new Prisma.Decimal("140") },
    ],
  });
  // proceeds = 50*120 + 50*140 = 13000; cost = 100*100 = 10000; profit = 3000.
  assert.equal(result.proceeds.toString(), "13000");
  assert.equal(result.profitOrLoss.toString(), "3000");
});

test("breakeven sale produces zero profit/loss", () => {
  const result = calculateSettlement({
    sharesAllotted: 100,
    issuePrice: new Prisma.Decimal("100"),
    sales: [{ shares: 100, sellPrice: new Prisma.Decimal("100") }],
  });
  assert.equal(result.profitOrLoss.toString(), "0");
  assert.equal(result.isProfit, false);
});

test("only shares actually allotted are used as the cost basis, not shares applied for", () => {
  // Applied for more lots than were allotted — cost basis must use the allotted shares only.
  const result = calculateSettlement({
    sharesAllotted: 20,
    issuePrice: new Prisma.Decimal("100"),
    sales: [{ shares: 20, sellPrice: new Prisma.Decimal("110") }],
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
  });
  assert.equal(result.profitOrLoss.toString(), "0.03");
});

test("no sales recorded yet means zero proceeds and a loss equal to the full cost basis", () => {
  const result = calculateSettlement({
    sharesAllotted: 10,
    issuePrice: new Prisma.Decimal("100"),
    sales: [],
  });
  assert.equal(result.proceeds.toString(), "0");
  assert.equal(result.profitOrLoss.toString(), "-1000");
});

test("netAmount overrides shares * sellPrice to account for real-world taxes and charges", () => {
  // Real scenario: 1 lot (26 shares) bought at issue price 14930/share, sold @ 620/share.
  // Gross would be 26 * 620 = 16120, but the broker only credited 16059 after STT/charges.
  const result = calculateSettlement({
    sharesAllotted: 26,
    issuePrice: new Prisma.Decimal("14930"),
    sales: [
      {
        shares: 26,
        sellPrice: new Prisma.Decimal("620"),
        netAmount: new Prisma.Decimal("16059"),
      },
    ],
  });
  assert.equal(result.proceeds.toString(), "16059");
  assert.notEqual(result.proceeds.toString(), "16120");
});

test("falls back to shares * sellPrice when netAmount is not provided (backward compatible)", () => {
  const result = calculateSettlement({
    sharesAllotted: 26,
    issuePrice: new Prisma.Decimal("100"),
    sales: [{ shares: 26, sellPrice: new Prisma.Decimal("620") }],
  });
  assert.equal(result.proceeds.toString(), "16120");
});

test("falls back to shares * sellPrice when netAmount is explicitly null", () => {
  const result = calculateSettlement({
    sharesAllotted: 26,
    issuePrice: new Prisma.Decimal("100"),
    sales: [{ shares: 26, sellPrice: new Prisma.Decimal("620"), netAmount: null }],
  });
  assert.equal(result.proceeds.toString(), "16120");
});

test("mixes tranches with and without a netAmount override in the same settlement", () => {
  const result = calculateSettlement({
    sharesAllotted: 52,
    issuePrice: new Prisma.Decimal("100"),
    sales: [
      { shares: 26, sellPrice: new Prisma.Decimal("620"), netAmount: new Prisma.Decimal("16059") },
      { shares: 26, sellPrice: new Prisma.Decimal("620") },
    ],
  });
  // 16059 (net, tranche 1) + 16120 (gross, tranche 2) = 32179.
  assert.equal(result.proceeds.toString(), "32179");
});

test("calculateSettlement no longer computes a commission — that is now recorded manually", () => {
  const result = calculateSettlement({
    sharesAllotted: 100,
    issuePrice: new Prisma.Decimal("100"),
    sales: [{ shares: 100, sellPrice: new Prisma.Decimal("150") }],
  });
  assert.equal("commission" in result, false);
});
