import { Router } from "express";
import {
  getMemberLedger,
  getMemberWallet,
  recordCommission,
  recordMoneyReturned,
  recordMoneySent,
} from "../controllers/ledger.controller";

// mergeParams so ":id" from the parent member router (e.g. /members/:id) is visible here.
export const ledgerRouter = Router({ mergeParams: true });

ledgerRouter.get("/ledger", getMemberLedger);
ledgerRouter.post("/ledger/money-sent", recordMoneySent);
ledgerRouter.post("/ledger/money-returned", recordMoneyReturned);
ledgerRouter.post("/ledger/commission", recordCommission);
ledgerRouter.get("/wallet", getMemberWallet);
