import { analysisRepository } from "../repositories/analysis.repository";
import {
  calculateAverages,
  calculateIpoAnalysis,
  calculateMemberAnalysis,
  calculateMonthlyAnalysis,
} from "./analysisCalculator";
import type { AnalysisApplicationInput, AnalysisLedgerEntry } from "./analysisCalculator";

export const analysisService = {
  async getSummary() {
    const [ledgerRows, applicationRows] = await Promise.all([
      analysisRepository.findAllLedgerEntries(),
      analysisRepository.findAllottedApplications(),
    ]);

    const entries: AnalysisLedgerEntry[] = ledgerRows.map((row) => ({
      type: row.type,
      credit: row.credit,
      debit: row.debit,
      createdAt: row.createdAt,
      ipoId: row.ipoId,
      ipoCompany: row.ipo?.company ?? null,
      memberId: row.memberId,
      memberName: row.member.name,
    }));

    const applications: AnalysisApplicationInput[] = applicationRows.map((row) => ({
      ipoId: row.ipoId,
      ipoCompany: row.ipo.company,
      shares: row.shares,
      issuePrice: row.ipo.issuePrice,
    }));

    const monthly = calculateMonthlyAnalysis(entries);
    const ipos = calculateIpoAnalysis(entries, applications);
    const members = calculateMemberAnalysis(entries, new Date());
    const averages = calculateAverages(monthly);

    return { monthly, ipos, members, ...averages };
  },
};
