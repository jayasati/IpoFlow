import { z } from "zod";

export const createSettlementSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
  /** SELF-funded applications only: the operator's cut (on profit) or
   * compensation paid out (on loss). Omitted/zero means no money changed
   * hands between operator and member for this settlement. */
  operatorAmount: z.coerce.number().min(0).optional(),
});

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
