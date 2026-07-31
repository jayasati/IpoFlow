import { Router } from "express";
import {
  bulkCreateApplications,
  getApplication,
  listApplications,
  updateAllotment,
  updateFundingSource,
} from "../controllers/application.controller";
import { saleRouter } from "./sale.routes";

export const applicationRouter = Router();

applicationRouter.get("/", listApplications);
applicationRouter.post("/bulk", bulkCreateApplications);
applicationRouter.get("/:id", getApplication);
applicationRouter.put("/:id/allotment", updateAllotment);
applicationRouter.put("/:id/funding-source", updateFundingSource);
applicationRouter.use("/:id", saleRouter);
