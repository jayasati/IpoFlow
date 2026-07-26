import { z } from "zod";

export const createSaleSchema = z.object({
  shares: z.coerce.number().int().positive("Shares must be a positive whole number"),
  sellPrice: z.coerce.number().positive("Sell price must be greater than 0"),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
