import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { requireAuth } from "./middleware/requireAuth";
import { apiRouter } from "./routes";
import { authRouter } from "./routes/auth.routes";
import { healthRouter } from "./routes/health.routes";

export const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api", requireAuth, apiRouter);

app.use(errorHandler);
