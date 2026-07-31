import { prisma } from "../config/prisma";
import { ApplicationStatus } from "../generated/prisma/client";
import type { LedgerType, Prisma } from "../generated/prisma/client";

export interface SettlementLedgerEntryInput {
  type: LedgerType;
  credit: Prisma.Decimal | number;
  debit: Prisma.Decimal | number;
  description: string;
}

export interface OperatorTransactionInput {
  credit: Prisma.Decimal | number;
  debit: Prisma.Decimal | number;
  description: string;
}

export interface ApplySettlementParams {
  applicationId: number;
  memberId: number;
  ipoId: number;
  /** OPERATOR-funded settlements post these to the member's ledger. */
  entries: SettlementLedgerEntryInput[];
  /** SELF-funded settlements record the member's own profit/loss for display only
   * (never touches their ledger/wallet) and, if the operator took a cut or paid
   * compensation, a single row on the operator's own account. */
  memberProfitOrLoss?: Prisma.Decimal | number | null;
  operatorTransaction?: OperatorTransactionInput | null;
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

      if (params.operatorTransaction) {
        await tx.operatorTransaction.create({
          data: {
            applicationId: params.applicationId,
            memberId: params.memberId,
            ipoId: params.ipoId,
            credit: params.operatorTransaction.credit,
            debit: params.operatorTransaction.debit,
            description: params.operatorTransaction.description,
          },
        });
      }

      const application = await tx.application.update({
        where: { id: params.applicationId },
        data: {
          status: ApplicationStatus.SETTLED,
          memberProfitOrLoss: params.memberProfitOrLoss ?? undefined,
        },
        include: { member: true },
      });

      return { application, ledgerEntries };
    });
  },
};
