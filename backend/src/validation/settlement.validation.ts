import { z } from "zod";

export const createSettlementSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
});

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
