import { z } from "zod";
import * as proctoringService from "../services/proctoringService.js";

const startSchema = z.object({
  testId: z.union([z.string(), z.number()]),
});

const endSchema = z.object({
  proctoringSessionId: z.number().int().positive(),
});

const logViolationSchema = z.object({
  proctoringSessionId: z.number().int().positive(),
  violationType: z.string().min(1),
  severityScore: z.number().int().nonnegative().optional().default(0),
  meta: z.any().optional(),
  // allow client to pass timestamp, otherwise server uses current time
  timestamp: z.string().datetime().optional(),
});

export async function startProctoringSession(req, res, next) {
  try {
    const body = startSchema.parse(req.body);
    const session = await proctoringService.startSessionForUser({
      userId: req.auth.userId,
      testId: String(body.testId),
    });
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

export async function endProctoringSession(req, res, next) {
  try {
    const body = endSchema.parse(req.body);
    await proctoringService.endSession({
      sessionId: body.proctoringSessionId,
      userId: req.auth.userId,
      isAdmin: req.auth.role === "admin",
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function logViolation(req, res, next) {
  try {
    const body = logViolationSchema.parse(req.body);

    const createdAt = body.timestamp ? new Date(body.timestamp) : undefined;

    const out = await proctoringService.logViolation({
      proctoringSessionId: body.proctoringSessionId,
      userId: req.auth.userId,
      isAdmin: req.auth.role === "admin",
      violationType: body.violationType,
      severityScore: body.severityScore,
      metaJson: body.meta,
      createdAt,
    });

    res.json({ ok: true, ...out });
  } catch (err) {
    next(err);
  }
}

export async function getCandidateViolations(req, res, next) {
  try {
    const candidateId = Number(req.params.candidateId);
    if (!Number.isFinite(candidateId) || candidateId <= 0) {
      return res.status(400).json({ error: "Invalid candidateId" });
    }
    const violations = await proctoringService.getCandidateViolations({ candidateId });
    res.json({ candidateId, violations });
  } catch (err) {
    next(err);
  }
}

export async function listCandidateReports(req, res, next) {
  try {
    const reports = await proctoringService.listCandidateReports();
    res.json({ reports });
  } catch (err) {
    next(err);
  }
}

export async function getCandidateReport(req, res, next) {
  try {
    const candidateId = Number(req.params.candidateId);
    if (!Number.isFinite(candidateId) || candidateId <= 0) {
      return res.status(400).json({ error: "Invalid candidateId" });
    }
    const report = await proctoringService.getCandidateReport({ candidateId });
    if (!report) return res.status(404).json({ error: "Candidate report not found" });
    res.json({ candidateId, report });
  } catch (err) {
    next(err);
  }
}

