import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma/client";

export interface OperatorTransactionListFilter {
  skip: number;
  take: number;
}

export interface OperatorTransactionTotals {
  credit: Prisma.Decimal;
  debit: Prisma.Decimal;
}

const withDetails = {
  member: { select: { id: true, name: true } },
  ipo: { select: { id: true, company: true } },
} satisfies Prisma.OperatorTransactionInclude;

export const operatorTransactionRepository = {
  async findMany(filter: OperatorTransactionListFilter) {
    const [data, total] = await Promise.all([
      prisma.operatorTransaction.findMany({
        orderBy: { createdAt: "desc" },
        skip: filter.skip,
        take: filter.take,
        include: withDetails,
      }),
      prisma.operatorTransaction.count(),
    ]);
    return { data, total };
  },

  async aggregateTotals(): Promise<OperatorTransactionTotals> {
    const result = await prisma.operatorTransaction.aggregate({
      _sum: { credit: true, debit: true },
    });
    return {
      credit: result._sum.credit ?? new Prisma.Decimal(0),
      debit: result._sum.debit ?? new Prisma.Decimal(0),
    };
  },
};
