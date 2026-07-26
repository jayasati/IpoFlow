import { prisma } from "../config/prisma";
import { ApplicationStatus } from "../generated/prisma/client";
import type { LedgerType, Prisma } from "../generated/prisma/client";

export interface SettlementLedgerEntryInput {
  type: LedgerType;
  credit: Prisma.Decimal | number;
  debit: Prisma.Decimal | number;
  description: string;
}

export interface ApplySettlementParams {
  applicationId: number;
  memberId: number;
  ipoId: number;
  commissionRate: Prisma.Decimal;
  entries: SettlementLedgerEntryInput[];
}

export const settlementRepository = {
  applySettlement(params: ApplySettlementParams) {
    return prisma.$transaction(async (tx) => {
      const ledgerEntries = [];
      for (const entry of params.entries) {
        const created = await tx.ledger.create({
          data: {
            memberId: params.memberId,
            ipoId: params.ipoId,
            type: entry.type,
            credit: entry.credit,
            debit: entry.debit,
            description: entry.description,
          },
        });
        ledgerEntries.push(created);
      }

      const application = await tx.application.update({
        where: { id: params.applicationId },
        data: { commissionRate: params.commissionRate, status: ApplicationStatus.SETTLED },
        include: { member: true },
      });

      return { application, ledgerEntries };
    });
  },
};
