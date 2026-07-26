import { prisma } from "../config/prisma";
import type { ApplicationStatus } from "../generated/prisma/client";

export interface CreateSaleData {
  shares: number;
  sellPrice: number;
}

export const saleRepository = {
  findManyByApplication(applicationId: number) {
    return prisma.sale.findMany({ where: { applicationId }, orderBy: { soldAt: "asc" } });
  },

  async sumSharesByApplication(applicationId: number): Promise<number> {
    const result = await prisma.sale.aggregate({
      where: { applicationId },
      _sum: { shares: true },
    });
    return result._sum.shares ?? 0;
  },

  createAndUpdateStatus(
    applicationId: number,
    data: CreateSaleData,
    nextStatus: ApplicationStatus,
  ) {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: { applicationId, shares: data.shares, sellPrice: data.sellPrice },
      });
      const application = await tx.application.update({
        where: { id: applicationId },
        data: { status: nextStatus },
      });
      return { sale, application };
    });
  },
};
