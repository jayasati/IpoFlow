import { Prisma } from "../generated/prisma/client";

export interface WalletTotals {
  credit: Prisma.Decimal;
  debit: Prisma.Decimal;
}

export interface WalletBalance {
  credit: Prisma.Decimal;
  debit: Prisma.Decimal;
  /** Wallet = Credits - Debits. Always derived, never stored. */
  balance: Prisma.Decimal;
  /** Business rule: Outstanding amount = Wallet Balance. */
  outstanding: Prisma.Decimal;
}

export function calculateWalletBalance(totals: WalletTotals): WalletBalance {
  const balance = totals.credit.minus(totals.debit);
  return {
    credit: totals.credit,
    debit: totals.debit,
    balance,
    outstanding: balance,
  };
}
