import { Router } from "express";
import { createSettlement } from "../controllers/settlement.controller";

export const settlementRouter = Router();

// Matches docs/05-api.md exactly: "Settlement: POST /settlement".
settlementRouter.post("/", createSettlement);
