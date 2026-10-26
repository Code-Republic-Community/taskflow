import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config/env.ts";
import { router } from "./routes/index.ts";
import { notFound } from "./middlewares/notFound.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.clientUrl, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  if (config.nodeEnv === "development") app.use(morgan("dev"));

  app.use("/api/v1", router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
