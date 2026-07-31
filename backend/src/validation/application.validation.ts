import { z } from "zod";
import { FundingSource } from "../generated/prisma/client";

export const bulkApplicationSchema = z.object({
  ipoId: z.coerce.number().int().positive(),
  applications: z
    .array(
      z.object({
        memberId: z.number().int().positive(),
        lots: z.number().int().positive("Lots must be a positive whole number"),
        fundingSource: z.nativeEnum(FundingSource).optional(),
      }),
    )
    .min(1, "At least one member application is required"),
});

export const updateFundingSourceSchema = z.object({
  fundingSource: z.nativeEnum(FundingSource),
});

export const applicationListQuerySchema = z
  .object({
    ipoId: z.coerce.number().int().positive().optional(),
    memberId: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => data.ipoId !== undefined || data.memberId !== undefined, {
    message: "Either ipoId or memberId is required",
  });

export const updateAllotmentSchema = z.object({
  shares: z.coerce.number().int().min(0, "Shares cannot be negative"),
});

export type BulkApplicationBody = z.infer<typeof bulkApplicationSchema>;
export type UpdateAllotmentInput = z.infer<typeof updateAllotmentSchema>;
