import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  isDefault: z.boolean().default(false),
  memberIds: z.array(z.number().int().positive()).default([]),
});

export const updateGroupSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  isDefault: z.boolean().optional(),
});

export const groupMembersSchema = z.object({
  memberIds: z.array(z.number().int().positive()),
});

export const groupListQuerySchema = z.object({
  search: z.string().trim().max(150).optional(),
});

export const groupMemberParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  memberId: z.coerce.number().int().positive(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type GroupMembersInput = z.infer<typeof groupMembersSchema>;
