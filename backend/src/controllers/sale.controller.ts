import type { Request, Response } from "express";
import { saleService } from "../services/sale.service";
import { idParamSchema } from "../validation/common.validation";
import { createSaleSchema } from "../validation/sale.validation";

export async function listSales(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const sales = await saleService.listByApplication(id);
  res.json({ data: sales });
}

export async function createSale(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const input = createSaleSchema.parse(req.body);
  const result = await saleService.recordSale(id, input);
  res.status(201).json(result);
}
