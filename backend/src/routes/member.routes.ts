import { Router } from "express";
import {
  createMember,
  deleteMember,
  getMember,
  listMembers,
  updateMember,
} from "../controllers/member.controller";

export const memberRouter = Router();

memberRouter.get("/", listMembers);
memberRouter.post("/", createMember);
memberRouter.get("/:id", getMember);
memberRouter.put("/:id", updateMember);
memberRouter.delete("/:id", deleteMember);
