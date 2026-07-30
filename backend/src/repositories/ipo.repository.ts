import { prisma } from "../config/prisma";
import type { IpoStatus, Prisma } from "../generated/prisma/client";

export interface IpoListFilter {
  search?: string;
  status?: IpoStatus;
  sortBy: "company" | "issuePrice" | "createdAt";
  sortOrder: "asc" | "desc";
  skip: number;
  take: number;
}

export interface IpoStatusCount {
  status: IpoStatus;
  count: number;
}

const withApplicationCount = {
  _count: { select: { applications: true } },
} satisfies Prisma.IpoInclude;

function buildWhere(filter: Pick<IpoListFilter, "search" | "status">): Prisma.IpoWhereInput {
  const where: Prisma.IpoWhereInput = {};

  if (filter.search) {
    where.company = { contains: filter.search };
  }

  if (filter.status) {
    where.status = filter.status;
  }

  return where;
}

export const ipoRepository = {
  async findMany(filter: IpoListFilter) {
    const where = buildWhere(filter);
    const [data, total] = await Promise.all([
      prisma.ipo.findMany({
        where,
        orderBy: { [filter.sortBy]: filter.sortOrder },
        skip: filter.skip,
        take: filter.take,
        include: withApplicationCount,
      }),
      prisma.ipo.count({ where }),
    ]);
    return { data, total };
  },

  findById(id: number) {
    return prisma.ipo.findUnique({ where: { id }, include: withApplicationCount });
  },

  create(data: Prisma.IpoCreateInput) {
    return prisma.ipo.create({ data, include: withApplicationCount });
  },

  update(id: number, data: Prisma.IpoUpdateInput) {
    return prisma.ipo.update({ where: { id }, data, include: withApplicationCount });
  },

  delete(id: number) {
    return prisma.ipo.delete({ where: { id } });
  },

  /** Deletes the IPO along with every Ledger entry, Sale, and Application tied to it,
   * so it can be removed even after money movement or sales have been recorded. */
  deleteWithTransactions(id: number) {
    return prisma.$transaction(async (tx) => {
      await tx.ledger.deleteMany({ where: { ipoId: id } });
      await tx.sale.deleteMany({ where: { application: { ipoId: id } } });
      await tx.application.deleteMany({ where: { ipoId: id } });
      await tx.ipo.delete({ where: { id } });
    });
  },

  /** One query, grouped by status - serves both the "Active IPOs" count and the
   * status breakdown chart, avoiding a separate count() call. */
  async countByStatus(): Promise<IpoStatusCount[]> {
    const results = await prisma.ipo.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    return results.map((row) => ({ status: row.status, count: row._count._all }));
  },
};
