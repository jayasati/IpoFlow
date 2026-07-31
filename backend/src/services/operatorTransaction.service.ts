import { operatorTransactionRepository } from "../repositories/operatorTransaction.repository";
import { buildPaginatedResult } from "../utils/pagination";
import type { OperatorTransactionListQuery } from "../validation/operatorTransaction.validation";

export const operatorTransactionService = {
  async list(query: OperatorTransactionListQuery) {
    const skip = (query.page - 1) * query.pageSize;
    const [{ data, total }, totals] = await Promise.all([
      operatorTransactionRepository.findMany({ skip, take: query.pageSize }),
      operatorTransactionRepository.aggregateTotals(),
    ]);

    return {
      ...buildPaginatedResult(data, total, query.page, query.pageSize),
      netProfit: totals.credit.minus(totals.debit),
    };
  },
};
