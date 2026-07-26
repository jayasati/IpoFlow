import { ledgerRepository } from "../repositories/ledger.repository";
import { ipoRepository } from "../repositories/ipo.repository";
import { memberRepository } from "../repositories/member.repository";
import { calculateDashboard } from "./dashboardCalculator";

export const dashboardService = {
  async getSummary() {
    // 3 queries total for the whole dashboard: each groupBy below serves both a
    // card figure and a chart, so nothing is queried twice.
    const [ledgerTotals, ipoStatusCounts, memberCount] = await Promise.all([
      ledgerRepository.aggregateByType(),
      ipoRepository.countByStatus(),
      memberRepository.count(),
    ]);

    return calculateDashboard({ ledgerTotals, ipoStatusCounts, memberCount });
  },
};
