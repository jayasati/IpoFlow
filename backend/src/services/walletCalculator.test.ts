import { test } from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "../generated/prisma/client";
import { calculateWalletBalance } from "./walletCalculator";

test("balance is credits minus debits when credits exceed debits", () => {
  const result = calculateWalletBalance({
    credit: new Prisma.Decimal("20000"),
    debit: new Prisma.Decimal("12500"),
  });
  assert.equal(result.balance.toString(), "7500");
});

test("outstanding always equals balance (business rule: Outstanding = Wallet Balance)", () => {
  const result = calculateWalletBalance({
    credit: new Prisma.Decimal("100.50"),
    debit: new Prisma.Decimal("40.25"),
  });
  assert.equal(result.outstanding.toString(), result.balance.toString());
});

test("supports a negative balance when debits exceed credits", () => {
  const result = calculateWalletBalance({
    credit: new Prisma.Decimal("5000"),
    debit: new Prisma.Decimal("12000"),
  });
  assert.equal(result.balance.toString(), "-7000");
});

test("a member with no ledger activity has a zero balance", () => {
  const result = calculateWalletBalance({
    credit: new Prisma.Decimal(0),
    debit: new Prisma.Decimal(0),
  });
  assert.equal(result.balance.toString(), "0");
  assert.equal(result.outstanding.toString(), "0");
});

test("matches the Money Sent -> Money Returned worked example from docs/examples.md", () => {
  // Example 2 (docs/examples.md): Money Sent 15000, Money Returned 12000 -> Outstanding 3000.
  // (Loss/Commission from that example belong to the Settlement milestone, not this one.)
  const afterMoneySent = calculateWalletBalance({
    credit: new Prisma.Decimal("15000"),
    debit: new Prisma.Decimal("0"),
  });
  assert.equal(afterMoneySent.outstanding.toString(), "15000");

  const afterMoneyReturned = calculateWalletBalance({
    credit: new Prisma.Decimal("15000"),
    debit: new Prisma.Decimal("12000"),
  });
  assert.equal(afterMoneyReturned.outstanding.toString(), "3000");
});

test("preserves exact decimal precision (no floating-point drift)", () => {
  // A naive JS float subtraction (100.10 - 0.30) drifts to 99.79999999999999.
  const result = calculateWalletBalance({
    credit: new Prisma.Decimal("100.10"),
    debit: new Prisma.Decimal("0.30"),
  });
  assert.equal(result.balance.toString(), "99.8");
});

test("does not mutate or lose the original credit/debit totals", () => {
  const credit = new Prisma.Decimal("500");
  const debit = new Prisma.Decimal("200");
  const result = calculateWalletBalance({ credit, debit });
  assert.equal(result.credit.toString(), "500");
  assert.equal(result.debit.toString(), "200");
});
