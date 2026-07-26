import type { Request, Response } from "express";
import { participantGroupService } from "../services/participantGroup.service";
import { idParamSchema } from "../validation/common.validation";
import {
  createGroupSchema,
  groupListQuerySchema,
  groupMemberParamSchema,
  groupMembersSchema,
  updateGroupSchema,
} from "../validation/participantGroup.validation";

export async function listGroups(req: Request, res: Response): Promise<void> {
  const { search } = groupListQuerySchema.parse(req.query);
  const groups = await participantGroupService.list(search);
  res.json({ data: groups });
}

export async function getGroup(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const group = await participantGroupService.getById(id);
  res.json(group);
}

export async function createGroup(req: Request, res: Response): Promise<void> {
  const input = createGroupSchema.parse(req.body);
  const group = await participantGroupService.create(input);
  res.status(201).json(group);
}

export async function updateGroup(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const input = updateGroupSchema.parse(req.body);
  const group = await participantGroupService.update(id, input);
  res.json(group);
}

export async function deleteGroup(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  await participantGroupService.remove(id);
  res.status(204).send();
}

export async function setGroupMembers(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const { memberIds } = groupMembersSchema.parse(req.body);
  const group = await participantGroupService.setMembers(id, memberIds);
  res.json(group);
}

export async function addGroupMember(req: Request, res: Response): Promise<void> {
  const { id, memberId } = groupMemberParamSchema.parse(req.params);
  await participantGroupService.addMember(id, memberId);
  const group = await participantGroupService.getById(id);
  res.status(201).json(group);
}

export async function removeGroupMember(req: Request, res: Response): Promise<void> {
  const { id, memberId } = groupMemberParamSchema.parse(req.params);
  await participantGroupService.removeMember(id, memberId);
  const group = await participantGroupService.getById(id);
  res.json(group);
}
