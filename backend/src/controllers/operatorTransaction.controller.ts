import type { Request, Response } from "express";
import { operatorTransactionService } from "../services/operatorTransaction.service";
import { operatorTransactionListQuerySchema } from "../validation/operatorTransaction.validation";

export async function listOperatorTransactions(req: Request, res: Response): Promise<void> {
  const query = operatorTransactionListQuerySchema.parse(req.query);
  const result = await operatorTransactionService.list(query);
  res.json(result);
}
