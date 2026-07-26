import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma/client";
import type { LedgerType } from "../generated/prisma/client";

export interface LedgerListFilter {
  memberId: number;
  ipoId?: number;
  skip: number;
  take: number;
}

export interface LedgerTotals {
  credit: Prisma.Decimal;
  debit: Prisma.Decimal;
}

export interface LedgerTypeTotal extends LedgerTotals {
  type: LedgerType;
}

export const ledgerRepository = {
  async findManyByMember(filter: LedgerListFilter) {
    const where: Prisma.LedgerWhereInput = { memberId: filter.memberId };
    if (filter.ipoId) {
      where.ipoId = filter.ipoId;
    }

    const [data, total] = await Promise.all([
      prisma.ledger.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: filter.skip,
        take: filter.take,
      }),
      prisma.ledger.count({ where }),
    ]);
    return { data, total };
  },

  create(data: Prisma.LedgerCreateInput) {
    return prisma.ledger.create({ data });
  },

  async aggregateByMember(memberId: number): Promise<LedgerTotals> {
    const result = await prisma.ledger.aggregate({
      where: { memberId },
      _sum: { credit: true, debit: true },
    });
    return {
      credit: result._sum.credit ?? new Prisma.Decimal(0),
      debit: result._sum.debit ?? new Prisma.Decimal(0),
    };
  },

  /** One query, grouped by type - serves both the portfolio-wide wallet/capital/profit
   * figures and the ledger breakdown chart, avoiding a separate aggregate per metric. */
  async aggregateByType(): Promise<LedgerTypeTotal[]> {
    const results = await prisma.ledger.groupBy({
      by: ["type"],
      _sum: { credit: true, debit: true },
    });
    return results.map((row) => ({
      type: row.type,
      credit: row._sum.credit ?? new Prisma.Decimal(0),
      debit: row._sum.debit ?? new Prisma.Decimal(0),
    }));
  },
};
