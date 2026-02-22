import { query } from "../db/pool.js";

function groupBy(arr, keyFn) {
  const map = new Map();
  for (const item of arr) {
    const key = keyFn(item);
    const list = map.get(key) || [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

export async function listPosts() {
  const posts = await query(
    "SELECT id, author_user_id as authorId, author_name as authorName, author_company as authorCompany, title, content, created_at as createdAt FROM alumni_posts ORDER BY created_at DESC",
  );

  if (posts.length === 0) {
    return [];
  }

  const postIds = posts.map((p) => p.id);

  const likes = await query(
    `SELECT post_id as postId, COUNT(*) as likes FROM alumni_likes WHERE post_id IN (${postIds.map(() => "?").join(",")}) GROUP BY post_id`,
    postIds,
  );

  const likesMap = new Map(likes.map((l) => [l.postId, Number(l.likes)]));

  const comments = await query(
    `SELECT id, post_id as postId, author_user_id as authorId, author_name as authorName, content, created_at as createdAt
     FROM alumni_comments
     WHERE post_id IN (${postIds.map(() => "?").join(",")})
     ORDER BY created_at ASC`,
    postIds,
  );

  const commentsByPost = groupBy(comments, (c) => c.postId);

  return posts.map((p) => ({
    id: String(p.id),
    authorId: String(p.authorId),
    authorName: p.authorName,
    authorCompany: p.authorCompany,
    title: p.title,
    content: p.content,
    createdAt: p.createdAt,
    likes: likesMap.get(p.id) || 0,
    comments: (commentsByPost.get(p.id) || []).map((c) => ({
      id: String(c.id),
      authorId: String(c.authorId),
      authorName: c.authorName,
      content: c.content,
      createdAt: c.createdAt,
    })),
  }));
}

export async function createPost({ authorUserId, authorName, authorCompany, title, content }) {
  const result = await query(
    "INSERT INTO alumni_posts (author_user_id, author_name, author_company, title, content) VALUES (?, ?, ?, ?, ?)",
    [authorUserId, authorName, authorCompany || "Not Specified", title, content],
  );

  return String(result.insertId);
}

export async function addComment({ postId, authorUserId, authorName, content }) {
  const result = await query(
    "INSERT INTO alumni_comments (post_id, author_user_id, author_name, content) VALUES (?, ?, ?, ?)",
    [postId, authorUserId, authorName, content],
  );

  return String(result.insertId);
}

export async function likePost({ postId, userId }) {
  await query("INSERT IGNORE INTO alumni_likes (post_id, user_id) VALUES (?, ?)", [postId, userId]);

  const rows = await query("SELECT COUNT(*) as likes FROM alumni_likes WHERE post_id = ?", [postId]);
  return Number(rows[0]?.likes || 0);
}
