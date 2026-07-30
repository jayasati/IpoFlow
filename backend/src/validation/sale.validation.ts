import { z } from "zod";

export const createSaleSchema = z.object({
  shares: z.coerce.number().int().positive("Shares must be a positive whole number"),
  sellPrice: z.coerce.number().positive("Sell price must be greater than 0"),
  // Actual amount credited after taxes/charges. When provided, this is used as the
  // tranche's proceeds instead of shares * sellPrice, since real broker statements
  // rarely match the gross figure exactly (STT, brokerage, GST, etc.).
  netAmount: z.coerce.number().positive("Net amount must be greater than 0").optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
