import { Router } from "express";
import {
  cloneIpo,
  createIpo,
  deleteIpo,
  getIpo,
  listIpos,
  updateIpo,
  updateIpoStatus,
} from "../controllers/ipo.controller";

export const ipoRouter = Router();

ipoRouter.get("/", listIpos);
ipoRouter.post("/", createIpo);
ipoRouter.get("/:id", getIpo);
ipoRouter.put("/:id", updateIpo);
ipoRouter.delete("/:id", deleteIpo);
ipoRouter.put("/:id/status", updateIpoStatus);
ipoRouter.post("/:id/clone", cloneIpo);
