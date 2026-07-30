import type { Request, Response } from "express";
import { analysisService } from "../services/analysis.service";

export async function getAnalysis(_req: Request, res: Response): Promise<void> {
  const summary = await analysisService.getSummary();
  res.json(summary);
}
