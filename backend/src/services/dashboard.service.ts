import { ledgerRepository } from "../repositories/ledger.repository";
import { ipoRepository } from "../repositories/ipo.repository";
import { memberRepository } from "../repositories/member.repository";
import { operatorTransactionRepository } from "../repositories/operatorTransaction.repository";
import { calculateDashboard } from "./dashboardCalculator";

export const dashboardService = {
  async getSummary() {
    const [ledgerTotals, ipoStatusCounts, memberCount, operatorTotals] = await Promise.all([
      ledgerRepository.aggregateByType(),
      ipoRepository.countByStatus(),
      memberRepository.count(),
      operatorTransactionRepository.aggregateTotals(),
    ]);

    return calculateDashboard({
      ledgerTotals,
      ipoStatusCounts,
      memberCount,
      operatorNet: operatorTotals.credit.minus(operatorTotals.debit),
    });
  },
};
