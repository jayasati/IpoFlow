import { z } from "zod";

export const bulkApplicationSchema = z.object({
  ipoId: z.coerce.number().int().positive(),
  applications: z
    .array(
      z.object({
        memberId: z.number().int().positive(),
        lots: z.number().int().positive("Lots must be a positive whole number"),
      }),
    )
    .min(1, "At least one member application is required"),
});

export const applicationListQuerySchema = z.object({
  ipoId: z.coerce.number().int().positive(),
});

export type BulkApplicationBody = z.infer<typeof bulkApplicationSchema>;
