import { Router } from "express";
import { handleAIChat, handleAIStatus } from "../controllers/aiController.js";

const router = Router();

// POST /api/ai/chat - Send a message to the AI chatbot
router.post("/chat", handleAIChat);
// GET /api/ai/status - Check AI provider status
router.get("/status", handleAIStatus);

export { router as aiRoutes };
