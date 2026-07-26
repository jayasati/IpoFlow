import { z } from "zod";
import { paginationQuerySchema } from "../utils/pagination";

export const createMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  phone: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(2000).optional(),
  defaultCommissionRate: z.coerce.number().min(0).max(100).default(0),
});

export const updateMemberSchema = createMemberSchema.partial();

export const memberListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(150).optional(),
  groupId: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(["name", "createdAt", "defaultCommissionRate"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type MemberListQuery = z.infer<typeof memberListQuerySchema>;
