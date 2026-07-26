import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";

export const dashboardRouter = Router();

// Matches docs/05-api.md exactly: "Dashboard: GET /dashboard".
dashboardRouter.get("/", getDashboard);
