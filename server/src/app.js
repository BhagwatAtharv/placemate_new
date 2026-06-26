import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/authRoutes.js";
import { testsRoutes } from "./routes/testsRoutes.js";
import { materialsRoutes } from "./routes/materialsRoutes.js";
import { contestsRoutes } from "./routes/contestsRoutes.js";
import { resultsRoutes } from "./routes/resultsRoutes.js";
import { alumniRoutes } from "./routes/alumniRoutes.js";
import { aiRoutes } from "./routes/aiRoutes.js";
import { proctoringRoutes } from "./routes/proctoringRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {

  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));

  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/tests", testsRoutes);
  app.use("/api/materials", materialsRoutes);
  app.use("/api/contests", contestsRoutes);
  app.use("/api/results", resultsRoutes);
  app.use("/api/alumni", alumniRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/proctoring", proctoringRoutes);

  app.use(errorHandler);

  return app;
}
