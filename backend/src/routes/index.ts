import { Router } from "express";
import { applicationRouter } from "./application.routes";
import { dashboardRouter } from "./dashboard.routes";
import { ipoRouter } from "./ipo.routes";
import { memberRouter } from "./member.routes";
import { participantGroupRouter } from "./participantGroup.routes";
import { settlementRouter } from "./settlement.routes";

export const apiRouter = Router();

apiRouter.use("/members", memberRouter);
apiRouter.use("/groups", participantGroupRouter);
apiRouter.use("/ipos", ipoRouter);
apiRouter.use("/applications", applicationRouter);
apiRouter.use("/settlement", settlementRouter);
apiRouter.use("/dashboard", dashboardRouter);
