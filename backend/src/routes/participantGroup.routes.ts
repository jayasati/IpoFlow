import { Router } from "express";
import {
  addGroupMember,
  createGroup,
  deleteGroup,
  getDefaultGroup,
  getGroup,
  listGroups,
  removeGroupMember,
  setGroupMembers,
  updateGroup,
} from "../controllers/participantGroup.controller";

export const participantGroupRouter = Router();

participantGroupRouter.get("/", listGroups);
participantGroupRouter.post("/", createGroup);
// Must be registered before "/:id" so "default" isn't captured as an :id param.
participantGroupRouter.get("/default", getDefaultGroup);
participantGroupRouter.get("/:id", getGroup);
participantGroupRouter.put("/:id", updateGroup);
participantGroupRouter.delete("/:id", deleteGroup);
participantGroupRouter.put("/:id/members", setGroupMembers);
participantGroupRouter.post("/:id/members/:memberId", addGroupMember);
participantGroupRouter.delete("/:id/members/:memberId", removeGroupMember);
