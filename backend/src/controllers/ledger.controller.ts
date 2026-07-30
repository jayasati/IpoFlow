import type { Request, Response } from "express";
import { ledgerService } from "../services/ledger.service";
import { walletService } from "../services/wallet.service";
import { idParamSchema } from "../validation/common.validation";
import { ledgerListQuerySchema, recordMoneyMovementSchema } from "../validation/ledger.validation";

export async function getMemberLedger(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const query = ledgerListQuerySchema.parse(req.query);
  const [ledger, wallet] = await Promise.all([
    ledgerService.listByMember(id, query),
    walletService.getBalance(id),
  ]);
  res.json({ ...ledger, wallet });
}

export async function getMemberWallet(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const wallet = await walletService.getBalance(id);
  res.json(wallet);
}

export async function recordMoneySent(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const input = recordMoneyMovementSchema.parse(req.body);
  const entry = await ledgerService.recordMoneySent(id, input);
  res.status(201).json(entry);
}

export async function recordMoneyReturned(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const input = recordMoneyMovementSchema.parse(req.body);
  const entry = await ledgerService.recordMoneyReturned(id, input);
  res.status(201).json(entry);
}

export async function recordCommission(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const input = recordMoneyMovementSchema.parse(req.body);
  const entry = await ledgerService.recordCommission(id, input);
  res.status(201).json(entry);
}
