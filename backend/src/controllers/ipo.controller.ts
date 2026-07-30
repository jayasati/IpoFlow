import type { Request, Response } from "express";
import { ipoService } from "../services/ipo.service";
import { getAllowedNextStatuses } from "../services/ipoStateMachine";
import { idParamSchema } from "../validation/common.validation";
import {
  createIpoSchema,
  ipoListQuerySchema,
  ipoStatusUpdateSchema,
  updateIpoSchema,
} from "../validation/ipo.validation";
import type { IpoStatus } from "../generated/prisma/client";

function withTransitions<T extends { status: IpoStatus }>(
  ipo: T,
): T & { allowedNextStatuses: IpoStatus[] } {
  return { ...ipo, allowedNextStatuses: getAllowedNextStatuses(ipo.status) };
}

export async function listIpos(req: Request, res: Response): Promise<void> {
  const query = ipoListQuerySchema.parse(req.query);
  const result = await ipoService.list(query);
  res.json({ ...result, data: result.data.map(withTransitions) });
}

export async function getIpo(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const ipo = await ipoService.getById(id);
  res.json(withTransitions(ipo));
}

export async function createIpo(req: Request, res: Response): Promise<void> {
  const input = createIpoSchema.parse(req.body);
  const ipo = await ipoService.create(input);
  res.status(201).json(withTransitions(ipo));
}

export async function updateIpo(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const input = updateIpoSchema.parse(req.body);
  const ipo = await ipoService.update(id, input);
  res.json(withTransitions(ipo));
}

export async function deleteIpo(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  await ipoService.remove(id);
  res.status(204).send();
}

export async function revertAndDeleteIpo(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  await ipoService.removeWithTransactions(id);
  res.status(204).send();
}

export async function updateIpoStatus(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const { status } = ipoStatusUpdateSchema.parse(req.body);
  const ipo = await ipoService.updateStatus(id, status);
  res.json(withTransitions(ipo));
}

export async function cloneIpo(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const ipo = await ipoService.clone(id);
  res.status(201).json(withTransitions(ipo));
}
