import { prisma } from "../config/prisma";
import type { Prisma } from "../generated/prisma/client";

export interface MemberListFilter {
  search?: string;
  groupId?: number;
  sortBy: "name" | "createdAt" | "defaultCommissionRate";
  sortOrder: "asc" | "desc";
  skip: number;
  take: number;
}

function buildWhere(filter: Pick<MemberListFilter, "search" | "groupId">): Prisma.MemberWhereInput {
  const where: Prisma.MemberWhereInput = {};

  if (filter.search) {
    where.OR = [{ name: { contains: filter.search } }, { phone: { contains: filter.search } }];
  }

  if (filter.groupId) {
    where.groupMemberships = { some: { groupId: filter.groupId } };
  }

  return where;
}

export const memberRepository = {
  async findMany(filter: MemberListFilter) {
    const where = buildWhere(filter);
    const [data, total] = await Promise.all([
      prisma.member.findMany({
        where,
        orderBy: { [filter.sortBy]: filter.sortOrder },
        skip: filter.skip,
        take: filter.take,
      }),
      prisma.member.count({ where }),
    ]);
    return { data, total };
  },

  findById(id: number) {
    return prisma.member.findUnique({ where: { id } });
  },

  create(data: Prisma.MemberCreateInput) {
    return prisma.member.create({ data });
  },

  update(id: number, data: Prisma.MemberUpdateInput) {
    return prisma.member.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.member.delete({ where: { id } });
  },

  count(): Promise<number> {
    return prisma.member.count();
  },
};
