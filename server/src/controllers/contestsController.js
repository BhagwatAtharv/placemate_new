import { z } from "zod";
import { createContest, joinContest, listContests } from "../models/contestModel.js";

const createContestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  testIds: z.array(z.union([z.string(), z.number()])).default([]),
});

export async function getContests(req, res, next) {
  try {
    const contests = await listContests();
    res.json({ contests });
  } catch (err) {
    next(err);
  }
}

export async function postContest(req, res, next) {
  try {
    const body = createContestSchema.parse(req.body);
    const id = await createContest({
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      testIds: body.testIds.map(String),
    });
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

export async function join(req, res, next) {
  try {
    const contestId = req.params.id;
    await joinContest({ contestId, userId: req.auth.userId });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
