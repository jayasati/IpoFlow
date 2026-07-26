import type { Request, Response } from "express";
import { memberService } from "../services/member.service";
import { idParamSchema } from "../validation/common.validation";
import {
  createMemberSchema,
  memberListQuerySchema,
  updateMemberSchema,
} from "../validation/member.validation";

export async function listMembers(req: Request, res: Response): Promise<void> {
  const query = memberListQuerySchema.parse(req.query);
  const result = await memberService.list(query);
  res.json(result);
}

export async function getMember(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const member = await memberService.getById(id);
  res.json(member);
}

export async function createMember(req: Request, res: Response): Promise<void> {
  const input = createMemberSchema.parse(req.body);
  const member = await memberService.create(input);
  res.status(201).json(member);
}

export async function updateMember(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const input = updateMemberSchema.parse(req.body);
  const member = await memberService.update(id, input);
  res.json(member);
}

export async function deleteMember(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  await memberService.remove(id);
  res.status(204).send();
}
