import { applicationService } from "./application.service";
import { settlementRepository } from "../repositories/settlement.repository";
import { calculateSettlement } from "./settlementCalculator";
import { ValidationError } from "../errors/AppError";
import { ApplicationStatus, LedgerType } from "../generated/prisma/client";
import type { SettlementLedgerEntryInput } from "../repositories/settlement.repository";

export const settlementService = {
  async settle(applicationId: number) {
    const application = await applicationService.getById(applicationId);

    if (application.status === ApplicationStatus.SETTLED) {
      throw new ValidationError("This application has already been settled.");
    }
    if (application.status !== ApplicationStatus.SOLD) {
      throw new ValidationError(
        `Cannot settle an application with status ${application.status}. All allotted shares must be sold first.`,
      );
    }

    const result = calculateSettlement({
      sharesAllotted: application.shares,
      issuePrice: application.ipo.issuePrice,
      sales: application.sales.map((sale) => ({
        shares: sale.shares,
        sellPrice: sale.sellPrice,
        netAmount: sale.netAmount,
      })),
    });

    // Commission is recorded manually per member (see ledgerService.recordCommission),
    // not computed here — the operator decides the amount and pays it at their discretion.
    const entries: SettlementLedgerEntryInput[] = [];
    if (!result.profitOrLoss.isZero()) {
      entries.push({
        type: result.isProfit ? LedgerType.PROFIT : LedgerType.LOSS,
        credit: result.isProfit ? result.profitOrLoss : 0,
        debit: result.isProfit ? 0 : result.profitOrLoss.abs(),
        description: `${result.isProfit ? "Profit" : "Loss"} on ${application.ipo.company} (application #${application.id})`,
      });
    }

    const { application: updated, ledgerEntries } = await settlementRepository.applySettlement({
      applicationId: application.id,
      memberId: application.memberId,
      ipoId: application.ipoId,
      entries,
    });

    return {
      application: updated,
      ledgerEntries,
      proceeds: result.proceeds,
      costBasis: result.costBasis,
      profitOrLoss: result.profitOrLoss,
      isProfit: result.isProfit,
    };
  },
};
