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
};
