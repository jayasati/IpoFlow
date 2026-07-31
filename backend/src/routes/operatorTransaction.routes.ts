import { Router } from "express";
import { listOperatorTransactions } from "../controllers/operatorTransaction.controller";

export const operatorTransactionRouter = Router();

operatorTransactionRouter.get("/", listOperatorTransactions);
