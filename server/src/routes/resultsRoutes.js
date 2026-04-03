import { Router } from "express";
import { getMyResults, getAllResults, submit } from "../controllers/resultsController.js";
import { requireAuth } from "../middleware/auth.js";

export const resultsRoutes = Router();

resultsRoutes.get("/me", requireAuth, getMyResults);
resultsRoutes.get("/all", requireAuth, getAllResults);
resultsRoutes.post("/", requireAuth, submit);
