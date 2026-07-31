import { apiGet } from "./client";
import type { OperatorTransactionList } from "../types/operatorTransaction";

export function listOperatorTransactions(
  page = 1,
  pageSize = 20,
): Promise<OperatorTransactionList> {
  return apiGet(`/operator-transactions?page=${page}&pageSize=${pageSize}`);
}
