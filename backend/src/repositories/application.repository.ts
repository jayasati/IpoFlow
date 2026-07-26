import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma/client";

export interface BulkApplicationItem {
  memberId: number;
  lots: number;
}

const withMember = {
  member: true,
} satisfies Prisma.ApplicationInclude;

export const applicationRepository = {
  findManyByIpo(ipoId: number) {
    return prisma.application.findMany({
      where: { ipoId },
      include: withMember,
      orderBy: { member: { name: "asc" } },
    });
  },

  async createMany(ipoId: number, applications: BulkApplicationItem[]) {
    return prisma.$transaction(async (tx) => {
      const created = [];
      const skippedMemberIds: number[] = [];

      for (const application of applications) {
        try {
          const record = await tx.application.create({
            data: { ipoId, memberId: application.memberId, lots: application.lots },
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
