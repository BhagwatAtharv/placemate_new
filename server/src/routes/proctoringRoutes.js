import { Router } from "express";
import {
  startProctoringSession,
  endProctoringSession,
  logViolation,
  getCandidateViolations,
  listCandidateReports,
  getCandidateReport,
} from "../controllers/proctoringController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Candidate/Admin should be authorized in the calling app.
// For now we require auth; in production you can restrict further (admin-only for report).
router.post("/session/start", requireAuth, startProctoringSession);
router.post("/session/end", requireAuth, endProctoringSession);

router.post("/violations/log", requireAuth, logViolation);

router.get("/reports", requireAuth, requireRole("admin"), listCandidateReports);
router.get("/candidates/:candidateId/violations", requireAuth, getCandidateViolations);
router.get("/candidates/:candidateId/report", requireAuth, requireRole("admin"), getCandidateReport);

export { router as proctoringRoutes };

