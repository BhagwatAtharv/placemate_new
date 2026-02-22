import { Router } from "express";
import { getContests, join, postContest } from "../controllers/contestsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const contestsRoutes = Router();

contestsRoutes.get("/", requireAuth, getContests);
contestsRoutes.post("/", requireAuth, requireRole("admin"), postContest);
contestsRoutes.post("/:id/join", requireAuth, join);
