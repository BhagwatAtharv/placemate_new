import { pool, query } from "../db/pool.js";

export async function listResultsForUser(userId) {
  const rows = await query(
    "SELECT id, user_id as userId, test_id as testId, test_title as testTitle, score, total_questions as totalQuestions, completed_at as completedAt FROM test_results WHERE user_id = ? ORDER BY completed_at DESC",
    [userId],
  );

  return rows.map((r) => ({
    id: String(r.id),
    userId: String(r.userId),
    testId: String(r.testId),
    testTitle: r.testTitle,
    score: Number(r.score),
    totalQuestions: Number(r.totalQuestions),
    completedAt: r.completedAt,
  }));
}

export async function createResult({ userId, testId, testTitle, score, totalQuestions, answers }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      "INSERT INTO test_results (user_id, test_id, test_title, score, total_questions, completed_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [userId, testId, testTitle, score, totalQuestions],
    );

    const resultId = result.insertId;

    for (const a of answers || []) {
      await conn.execute(
        "INSERT INTO test_result_answers (result_id, question_id, answer, is_correct) VALUES (?, ?, ?, ?)",
        [resultId, a.questionId, a.answer || "", a.isCorrect ? 1 : 0],
      );
    }

    await conn.commit();
    return String(resultId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
