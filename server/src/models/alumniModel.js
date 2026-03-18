import { query } from "../db/pool.js";

const META_MARKER = "\n\n[PLACEMATE_META]";

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

function extractMetaFromContent(content) {
  if (typeof content !== "string") {
    return { content: "", meta: null };
  }

  const idx = content.lastIndexOf(META_MARKER);
  if (idx === -1) {
    return { content, meta: null };
  }

  const raw = content.slice(idx + META_MARKER.length).trim();
  const clean = content.slice(0, idx).trimEnd();

  try {
    const meta = JSON.parse(raw);
    return { content: clean, meta };
  } catch {
    return { content, meta: null };
  }
}

function appendMetaToContent(content, meta) {
  if (!meta) return content;
  return `${content || ""}${META_MARKER}${JSON.stringify(meta)}`;
}

export async function listPosts() {
  let posts;
  try {
    posts = await query(
      "SELECT id, author_user_id as authorId, author_name as authorName, author_company as authorCompany, title, content, test_duration_mins as testDurationMins, aptitude_questions as aptitudeQuestions, aptitude_difficulty as aptitudeDifficulty, coding_questions as codingQuestions, coding_difficulty as codingDifficulty, created_at as createdAt FROM alumni_posts ORDER BY created_at DESC",
    );
  } catch {
    posts = await query(
      "SELECT id, author_user_id as authorId, author_name as authorName, author_company as authorCompany, title, content, created_at as createdAt FROM alumni_posts ORDER BY created_at DESC",
    );
  }

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

  return posts.map((p) => {
    const extracted = extractMetaFromContent(p.content);
    const meta = extracted.meta || {};

    return {
      id: String(p.id),
      authorId: String(p.authorId),
      authorName: p.authorName,
      authorCompany: p.authorCompany,
      title: p.title,
      content: extracted.content,
      testDurationMins:
        p.testDurationMins != null
          ? Number(p.testDurationMins)
          : meta.testDurationMins != null
            ? Number(meta.testDurationMins)
            : null,
      aptitudeQuestions:
        p.aptitudeQuestions != null
          ? Number(p.aptitudeQuestions)
          : meta.aptitudeQuestions != null
            ? Number(meta.aptitudeQuestions)
            : null,
      aptitudeDifficulty: p.aptitudeDifficulty || meta.aptitudeDifficulty || null,
      codingQuestions:
        p.codingQuestions != null
          ? Number(p.codingQuestions)
          : meta.codingQuestions != null
            ? Number(meta.codingQuestions)
            : null,
      codingDifficulty: p.codingDifficulty || meta.codingDifficulty || null,
      createdAt: p.createdAt,
      likes: likesMap.get(p.id) || 0,
      comments: (commentsByPost.get(p.id) || []).map((c) => ({
        id: String(c.id),
        authorId: String(c.authorId),
        authorName: c.authorName,
        content: c.content,
        createdAt: c.createdAt,
      })),
    };
  });
}

export async function createPost({
  authorUserId,
  authorName,
  authorCompany,
  title,
  content,
  testDurationMins,
  aptitudeQuestions,
  aptitudeDifficulty,
  codingQuestions,
  codingDifficulty,
}) {
  const meta =
    testDurationMins != null ||
    aptitudeQuestions != null ||
    aptitudeDifficulty != null ||
    codingQuestions != null ||
    codingDifficulty != null
      ? {
          testDurationMins: testDurationMins ?? null,
          aptitudeQuestions: aptitudeQuestions ?? null,
          aptitudeDifficulty: aptitudeDifficulty ?? null,
          codingQuestions: codingQuestions ?? null,
          codingDifficulty: codingDifficulty ?? null,
        }
      : null;

  let result;
  try {
    result = await query(
      "INSERT INTO alumni_posts (author_user_id, author_name, author_company, title, content, test_duration_mins, aptitude_questions, aptitude_difficulty, coding_questions, coding_difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        authorUserId,
        authorName,
        authorCompany || "Not Specified",
        title,
        content,
        testDurationMins ?? null,
        aptitudeQuestions ?? null,
        aptitudeDifficulty ?? null,
        codingQuestions ?? null,
        codingDifficulty ?? null,
      ],
    );
  } catch {
    // Backward-compatible fallback for existing DBs without the new columns.
    result = await query(
      "INSERT INTO alumni_posts (author_user_id, author_name, author_company, title, content) VALUES (?, ?, ?, ?, ?)",
      [
        authorUserId,
        authorName,
        authorCompany || "Not Specified",
        title,
        appendMetaToContent(content, meta),
      ],
    );
  }

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
