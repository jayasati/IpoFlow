import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

export async function getDashboard(_req: Request, res: Response): Promise<void> {
  const summary = await dashboardService.getSummary();
  res.json(summary);
}
