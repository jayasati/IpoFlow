import { z } from "zod";
import { paginationQuerySchema } from "../utils/pagination";

export const recordMoneyMovementSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  ipoId: z.coerce.number().int().positive().optional(),
  description: z.string().trim().max(500).optional(),
});

export const ledgerListQuerySchema = paginationQuerySchema.extend({
  ipoId: z.coerce.number().int().positive().optional(),
});

export type RecordMoneyMovementInput = z.infer<typeof recordMoneyMovementSchema>;
export type LedgerListQuery = z.infer<typeof ledgerListQuerySchema>;
