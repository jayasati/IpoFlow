import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma/client";
import type { ApplicationStatus, FundingSource } from "../generated/prisma/client";

export interface BulkApplicationItem {
  memberId: number;
  lots: number;
  fundingSource?: FundingSource;
}

export interface UpdateAllotmentData {
  shares: number;
  status: ApplicationStatus;
}

const withMember = {
  member: true,
} satisfies Prisma.ApplicationInclude;

const withIpo = {
  ipo: true,
} satisfies Prisma.ApplicationInclude;

const withDetails = {
  ipo: true,
  member: true,
  sales: true,
} satisfies Prisma.ApplicationInclude;

export const applicationRepository = {
  findManyByIpo(ipoId: number) {
    return prisma.application.findMany({
      where: { ipoId },
      include: withMember,
      orderBy: { member: { name: "asc" } },
    });
  },

  findManyByMember(memberId: number) {
    return prisma.application.findMany({
      where: { memberId },
      include: withIpo,
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: number) {
    return prisma.application.findUnique({ where: { id }, include: withDetails });
  },

  updateAllotment(id: number, data: UpdateAllotmentData) {
    return prisma.application.update({ where: { id }, data, include: withMember });
  },

  updateFundingSource(id: number, fundingSource: FundingSource) {
    return prisma.application.update({ where: { id }, data: { fundingSource }, include: withMember });
  },

  async createMany(ipoId: number, applications: BulkApplicationItem[]) {
    return prisma.$transaction(async (tx) => {
      const created = [];
      const skippedMemberIds: number[] = [];

      for (const application of applications) {
        try {
          const record = await tx.application.create({
            data: {
              ipoId,
              memberId: application.memberId,
              lots: application.lots,
              fundingSource: application.fundingSource,
            },
            include: withMember,
          });
          created.push(record);
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            skippedMemberIds.push(application.memberId);
          } else {
            throw err;
          }
        }
      }

      return { created, skippedMemberIds };
    });
  },
};
