import { Router } from "express";
import { getMaterials, postMaterial, removeMaterial } from "../controllers/materialsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const materialsRoutes = Router();

materialsRoutes.get("/", requireAuth, getMaterials);
materialsRoutes.post("/", requireAuth, requireRole("admin"), postMaterial);
materialsRoutes.delete("/:id", requireAuth, requireRole("admin"), removeMaterial);
