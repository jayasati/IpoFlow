import { analysisRepository } from "../repositories/analysis.repository";
import {
  calculateAverages,
  calculateIpoAnalysis,
  calculateMemberAnalysis,
  calculateMonthlyAnalysis,
} from "./analysisCalculator";
import type {
  AnalysisApplicationInput,
  AnalysisLedgerEntry,
  AnalysisOperatorTransaction,
} from "./analysisCalculator";

export const analysisService = {
  async getSummary() {
    const [ledgerRows, applicationRows, operatorTransactionRows] = await Promise.all([
      analysisRepository.findAllLedgerEntries(),
      analysisRepository.findAllottedApplications(),
      analysisRepository.findAllOperatorTransactions(),
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

    const operatorTransactions: AnalysisOperatorTransaction[] = operatorTransactionRows.map(
      (row) => ({
        memberId: row.memberId,
        memberName: row.member.name,
        ipoId: row.ipoId,
        credit: row.credit,
        debit: row.debit,
        createdAt: row.createdAt,
      }),
    );

    const monthly = calculateMonthlyAnalysis(entries, operatorTransactions);
    const ipos = calculateIpoAnalysis(entries, applications, operatorTransactions);
    const members = calculateMemberAnalysis(entries, operatorTransactions, new Date());
    const averages = calculateAverages(monthly);

    return { monthly, ipos, members, ...averages };
  },
};
