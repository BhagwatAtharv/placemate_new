import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { createTest, deleteTest, listTests } from "../models/testModel.js";

const questionSchema = z.object({
  text: z.string().min(1),
  type: z.enum(["mcq", "coding"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  testCases: z.array(z.object({ input: z.string(), output: z.string() })).optional(),
});

const createTestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["aptitude", "coding", "mixed"]),
  duration: z.number().int().min(1),
  company: z.string().optional(),
  questions: z.array(questionSchema).min(1),
});

export async function getTests(req, res, next) {
  try {
    const tests = await listTests();
    res.json({ tests });
  } catch (err) {
    next(err);
  }
}

export async function postTest(req, res, next) {
  try {
    const body = createTestSchema.parse(req.body);

    for (const q of body.questions) {
      if (q.type === "mcq") {
        if (!q.options || q.options.length < 2) {
          throw new ApiError(400, "MCQ question must have options");
        }
        if (!q.correctAnswer) {
          throw new ApiError(400, "MCQ question must have correctAnswer");
        }
      }
    }

    const id = await createTest(body);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

export async function removeTest(req, res, next) {
  try {
    const testId = req.params.id;
    await deleteTest(testId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
