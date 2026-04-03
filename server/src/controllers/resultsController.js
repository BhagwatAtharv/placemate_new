import { z } from "zod";
import { createResult, listResultsForUser, listAllResults } from "../models/resultModel.js";
import { listAllUsers } from "../models/userModel.js";

const submitSchema = z.object({
  testId: z.union([z.string(), z.number()]),
  testTitle: z.string().min(1),
  score: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
  answers: z
    .array(
      z.object({
        questionId: z.union([z.string(), z.number()]),
        answer: z.string().optional(),
        isCorrect: z.boolean().optional(),
      }),
    )
    .optional(),
});

export async function getMyResults(req, res, next) {
  try {
    const results = await listResultsForUser(req.auth.userId);
    res.json({ results });
  } catch (err) {
    next(err);
  }
}

export async function getAllResults(req, res, next) {
  try {
    if (req.auth.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const results = await listAllResults();
    const users = await listAllUsers();
    res.json({ results, users });
  } catch (err) {
    next(err);
  }
}

export async function submit(req, res, next) {
  try {
    const body = submitSchema.parse(req.body);
    const id = await createResult({
      userId: req.auth.userId,
      testId: String(body.testId),
      testTitle: body.testTitle,
      score: body.score,
      totalQuestions: body.totalQuestions,
      answers: (body.answers || []).map((a) => ({
        questionId: String(a.questionId),
        answer: a.answer || "",
        isCorrect: Boolean(a.isCorrect),
      })),
    });
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}
