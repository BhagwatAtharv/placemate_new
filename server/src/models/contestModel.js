import { pool, query } from "../db/pool.js";

function placeholders(count) {
  return Array.from({ length: count }).fill("?").join(",");
}

export async function listContests() {
  const contests = await query(
    "SELECT id, title, description, start_date as startDate, end_date as endDate, created_at as createdAt FROM contests ORDER BY created_at DESC",
  );

  if (contests.length === 0) {
    return [];
  }

  const ids = contests.map((c) => c.id);

  const participants = await query(
    `SELECT contest_id as contestId, user_id as userId FROM contest_participants WHERE contest_id IN (${placeholders(ids.length)})`,
    ids,
  );

  const byContest = new Map();
  for (const p of participants) {
    const arr = byContest.get(p.contestId) || [];
    arr.push(String(p.userId));
    byContest.set(p.contestId, arr);
  }

  const contestTests = await query(
    `SELECT contest_id as contestId, test_id as testId FROM contest_tests WHERE contest_id IN (${placeholders(ids.length)})`,
    ids,
  );

  const testsByContest = new Map();
  for (const t of contestTests) {
    const arr = testsByContest.get(t.contestId) || [];
    arr.push(String(t.testId));
    testsByContest.set(t.contestId, arr);
  }

  return contests.map((c) => ({
    id: String(c.id),
    title: c.title,
    description: c.description,
    startDate: c.startDate,
    endDate: c.endDate,
    tests: testsByContest.get(c.id) || [],
    participants: byContest.get(c.id) || [],
    createdAt: c.createdAt,
  }));
}

export async function createContest({ title, description, startDate, endDate, testIds }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      "INSERT INTO contests (title, description, start_date, end_date) VALUES (?, ?, ?, ?)",
      [title, description || "", startDate, endDate],
    );

    const contestId = result.insertId;

    for (const testId of testIds) {
      await conn.execute(
        "INSERT INTO contest_tests (contest_id, test_id) VALUES (?, ?)",
        [contestId, testId],
      );
    }

    await conn.commit();
    return String(contestId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function joinContest({ contestId, userId }) {
  await query(
    "INSERT IGNORE INTO contest_participants (contest_id, user_id) VALUES (?, ?)",
    [contestId, userId],
  );
}
