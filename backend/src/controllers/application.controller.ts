import type { Request, Response } from "express";
import { applicationService } from "../services/application.service";
import {
  applicationListQuerySchema,
  bulkApplicationSchema,
} from "../validation/application.validation";

export async function listApplications(req: Request, res: Response): Promise<void> {
  const { ipoId } = applicationListQuerySchema.parse(req.query);
  const applications = await applicationService.listByIpo(ipoId);
  res.json({ data: applications });
}

export async function bulkCreateApplications(req: Request, res: Response): Promise<void> {
  const input = bulkApplicationSchema.parse(req.body);
  const result = await applicationService.bulkCreate(input.ipoId, input.applications);
  res.status(201).json(result);
}
