import { Router } from "express";
import {
  addGroupMember,
  createGroup,
  deleteGroup,
  getGroup,
  listGroups,
  removeGroupMember,
  setGroupMembers,
  updateGroup,
} from "../controllers/participantGroup.controller";

export const participantGroupRouter = Router();

participantGroupRouter.get("/", listGroups);
participantGroupRouter.post("/", createGroup);
participantGroupRouter.get("/:id", getGroup);
participantGroupRouter.put("/:id", updateGroup);
participantGroupRouter.delete("/:id", deleteGroup);
participantGroupRouter.put("/:id/members", setGroupMembers);
participantGroupRouter.post("/:id/members/:memberId", addGroupMember);
participantGroupRouter.delete("/:id/members/:memberId", removeGroupMember);
