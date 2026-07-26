import { Router } from "express";
import { healthRouter } from "./health.routes";
import { memberRouter } from "./member.routes";
import { participantGroupRouter } from "./participantGroup.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/members", memberRouter);
apiRouter.use("/groups", participantGroupRouter);
