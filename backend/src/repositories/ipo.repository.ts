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
};
