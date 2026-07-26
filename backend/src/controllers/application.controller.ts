import type { Request, Response } from "express";
import { applicationService } from "../services/application.service";
import { idParamSchema } from "../validation/common.validation";
import {
  applicationListQuerySchema,
  bulkApplicationSchema,
  updateAllotmentSchema,
} from "../validation/application.validation";

export async function listApplications(req: Request, res: Response): Promise<void> {
  const { ipoId } = applicationListQuerySchema.parse(req.query);
  const applications = await applicationService.listByIpo(ipoId);
  res.json({ data: applications });
}

export async function getApplication(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const application = await applicationService.getById(id);
  res.json(application);
}

export async function bulkCreateApplications(req: Request, res: Response): Promise<void> {
  const input = bulkApplicationSchema.parse(req.body);
  const result = await applicationService.bulkCreate(input.ipoId, input.applications);
  res.status(201).json(result);
}

export async function updateAllotment(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const { shares } = updateAllotmentSchema.parse(req.body);
  const application = await applicationService.updateAllotment(id, shares);
  res.json(application);
}
