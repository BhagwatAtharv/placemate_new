import { Router } from "express";
import { getMyResults, submit } from "../controllers/resultsController.js";
import { requireAuth } from "../middleware/auth.js";

export const resultsRoutes = Router();

resultsRoutes.get("/me", requireAuth, getMyResults);
resultsRoutes.post("/", requireAuth, submit);
