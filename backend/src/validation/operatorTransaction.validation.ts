import { paginationQuerySchema } from "../utils/pagination";

export const operatorTransactionListQuerySchema = paginationQuerySchema;

export type OperatorTransactionListQuery = ReturnType<
  typeof operatorTransactionListQuerySchema.parse
>;
