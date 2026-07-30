import { Router } from "express";
import { getAnalysis } from "../controllers/analysis.controller";

export const analysisRouter = Router();

analysisRouter.get("/", getAnalysis);
