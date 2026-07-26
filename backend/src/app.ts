import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { apiRouter } from "./routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.use(errorHandler);
