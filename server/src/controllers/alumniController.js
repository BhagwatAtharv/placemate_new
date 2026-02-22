import { z } from "zod";
import { addComment, createPost, likePost, listPosts } from "../models/alumniModel.js";

const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  company: z.string().optional(),
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
