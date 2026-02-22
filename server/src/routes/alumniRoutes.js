import { Router } from "express";
import { getPosts, postComment, postLike, postPost } from "../controllers/alumniController.js";
import { requireAuth } from "../middleware/auth.js";

export const alumniRoutes = Router();

alumniRoutes.get("/posts", requireAuth, getPosts);
alumniRoutes.post("/posts", requireAuth, postPost);
alumniRoutes.post("/posts/:id/like", requireAuth, postLike);
alumniRoutes.post("/posts/:id/comments", requireAuth, postComment);
