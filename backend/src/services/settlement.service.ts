import { applicationService } from "./application.service";
import { settlementRepository } from "../repositories/settlement.repository";
import { calculateSettlement } from "./settlementCalculator";
import { ValidationError } from "../errors/AppError";
import { ApplicationStatus, FundingSource, LedgerType, Prisma } from "../generated/prisma/client";
import type {
  OperatorTransactionInput,
  SettlementLedgerEntryInput,
} from "../repositories/settlement.repository";

export const settlementService = {
  async settle(applicationId: number, operatorAmount?: number) {
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

    const isSelfFunded = application.fundingSource === FundingSource.SELF;
    const amount = new Prisma.Decimal(operatorAmount ?? 0);

    if (isSelfFunded && result.isProfit && amount.greaterThan(result.profitOrLoss)) {
      throw new ValidationError(
        `Your cut (${amount.toString()}) can't exceed the member's profit (${result.profitOrLoss.toString()}).`,
      );
    }

    // OPERATOR-funded: unchanged — full profit/loss posts to the member's ledger.
    // Commission is recorded manually per member (see ledgerService.recordCommission),
    // not computed here — the operator decides the amount and pays it at their discretion.
    const entries: SettlementLedgerEntryInput[] = [];
    if (!isSelfFunded && !result.profitOrLoss.isZero()) {
      entries.push({
        type: result.isProfit ? LedgerType.PROFIT : LedgerType.LOSS,
        credit: result.isProfit ? result.profitOrLoss : 0,
        debit: result.isProfit ? 0 : result.profitOrLoss.abs(),
        description: `${result.isProfit ? "Profit" : "Loss"} on ${application.ipo.company} (application #${application.id})`,
      });
    }

    // SELF-funded: the member's own money was never in our hands, so their ledger/wallet
    // is never touched. Only the operator's cut (profit) or compensation (loss) — if
    // any — is recorded, on the operator's own account, not the member's.
    let memberProfitOrLoss: Prisma.Decimal | null = null;
    let operatorTransaction: OperatorTransactionInput | null = null;
    if (isSelfFunded) {
      memberProfitOrLoss = result.isProfit
        ? result.profitOrLoss.minus(amount)
        : result.profitOrLoss.plus(amount);

      if (!amount.isZero()) {
        operatorTransaction = {
          credit: result.isProfit ? amount : 0,
          debit: result.isProfit ? 0 : amount,
          description: result.isProfit
            ? `Cut from ${application.member.name}'s profit on ${application.ipo.company} (application #${application.id})`
            : `Loss compensation to ${application.member.name} on ${application.ipo.company} (application #${application.id})`,
        };
      }
    }

    const { application: updated, ledgerEntries } = await settlementRepository.applySettlement({
      applicationId: application.id,
      memberId: application.memberId,
      ipoId: application.ipoId,
      entries,
      memberProfitOrLoss,
      operatorTransaction,
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
