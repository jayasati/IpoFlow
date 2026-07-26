import { Router } from "express";
import { bulkCreateApplications, listApplications } from "../controllers/application.controller";

export const applicationRouter = Router();

applicationRouter.get("/", listApplications);
applicationRouter.post("/bulk", bulkCreateApplications);
