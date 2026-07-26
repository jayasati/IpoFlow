import type { Request, Response } from "express";
import { settlementService } from "../services/settlement.service";
import { createSettlementSchema } from "../validation/settlement.validation";

export async function createSettlement(req: Request, res: Response): Promise<void> {
  const { applicationId } = createSettlementSchema.parse(req.body);
  const result = await settlementService.settle(applicationId);
  res.status(201).json(result);
}
