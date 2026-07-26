import { z } from "zod";
import { paginationQuerySchema } from "../utils/pagination";
import { IpoStatus } from "../generated/prisma/client";

export const createIpoSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(200),
  issuePrice: z.coerce.number().positive("Issue price must be greater than 0"),
  lotSize: z.coerce.number().int().positive("Lot size must be a positive whole number"),
});

export const updateIpoSchema = createIpoSchema.partial();

export const ipoListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(200).optional(),
  status: z.nativeEnum(IpoStatus).optional(),
  sortBy: z.enum(["company", "issuePrice", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const ipoStatusUpdateSchema = z.object({
  status: z.nativeEnum(IpoStatus),
});

export type CreateIpoInput = z.infer<typeof createIpoSchema>;
export type UpdateIpoInput = z.infer<typeof updateIpoSchema>;
export type IpoListQuery = z.infer<typeof ipoListQuerySchema>;
