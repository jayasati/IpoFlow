import { prisma } from "../config/prisma";

export const analysisRepository = {
  /** Every ledger entry with just enough of its ipo/member joined to bucket by
   * month, ipo, and member in one pass — cheap for this app's data volume and
   * avoids three separate groupBy round-trips. */
  findAllLedgerEntries() {
    return prisma.ledger.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        ipo: { select: { company: true } },
        member: { select: { name: true } },
      },
    });
  },

  /** Allotted applications only — capital deployed per IPO is shares * issuePrice
   * (the same cost basis settlementCalculator uses), not the MONEY_SENT ledger
   * total, since money-sent entries are only optionally tagged to an IPO. */
  findAllottedApplications() {
    return prisma.application.findMany({
      where: { shares: { gt: 0 } },
      select: {
        ipoId: true,
        shares: true,
        ipo: { select: { company: true, issuePrice: true } },
      },
    });
  },

  /** The operator's own account — cuts/compensation on SELF-funded settlements.
   * Never appears in the Ledger, so it has to be folded in separately. Includes
   * the member name directly since a SELF-funded member may have zero ledger
   * entries (their money never touched pooled capital) to resolve it from. */
  findAllOperatorTransactions() {
    return prisma.operatorTransaction.findMany({
      include: { member: { select: { name: true } } },
    });
  },

  /** SELF-funded settled applications — memberProfitOrLoss is the member's own
   * trading profit/loss (already net of the operator's cut/compensation), never
   * posted to the Ledger, so it's invisible to analysis unless fetched here. */
  findAllSelfFundedSettledApplications() {
    return prisma.application.findMany({
      where: { fundingSource: "SELF", status: "SETTLED" },
      select: { memberId: true, memberProfitOrLoss: true, member: { select: { name: true } } },
    });
  },
};
