import { Router } from "express";
import { getTests, postTest, removeTest } from "../controllers/testsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const testsRoutes = Router();

testsRoutes.get("/", requireAuth, getTests);
testsRoutes.post("/", requireAuth, requireRole("admin"), postTest);
testsRoutes.delete("/:id", requireAuth, requireRole("admin"), removeTest);
