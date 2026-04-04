import { z } from "zod";
import { addComment, createPost, likePost, listPosts } from "../models/alumniModel.js";

const optionalInt = (min, max) =>
  z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(min).max(max),
  ).optional();

const optionalDifficulty = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.enum(["Easy", "Medium", "Hard"]),
).optional();

const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  company: z.string().optional(),
  testDurationMins: optionalInt(1, 600),
  aptitudeQuestions: optionalInt(0, 500),
  aptitudeDifficulty: optionalDifficulty,
<<<<<<< HEAD
  technicalMcq: optionalInt(0, 500),
=======
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a
  codingQuestions: optionalInt(0, 200),
  codingDifficulty: optionalDifficulty,
});

const commentSchema = z.object({
  content: z.string().min(1),
});

export async function getPosts(req, res, next) {
  try {
    const posts = await listPosts();
    res.json({ posts });
  } catch (err) {
    next(err);
  }
}

export async function postPost(req, res, next) {
  try {
    const body = createPostSchema.parse(req.body);
    const id = await createPost({
      authorUserId: req.auth.userId,
      authorName: req.auth.name,
      authorCompany: body.company,
      title: body.title,
      content: body.content,
      testDurationMins: body.testDurationMins,
      aptitudeQuestions: body.aptitudeQuestions,
      aptitudeDifficulty: body.aptitudeDifficulty,
<<<<<<< HEAD
      technicalMcq: body.technicalMcq,
=======
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a
      codingQuestions: body.codingQuestions,
      codingDifficulty: body.codingDifficulty,
    });
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

export async function postLike(req, res, next) {
  try {
    const postId = req.params.id;
    const likes = await likePost({ postId, userId: req.auth.userId });
    res.json({ likes });
  } catch (err) {
    next(err);
  }
}

export async function postComment(req, res, next) {
  try {
    const postId = req.params.id;
    const body = commentSchema.parse(req.body);
    const id = await addComment({
      postId,
      authorUserId: req.auth.userId,
      authorName: req.auth.name,
      content: body.content,
    });
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}
