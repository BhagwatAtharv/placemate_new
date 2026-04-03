import { pool, query } from "../db/pool.js";

function placeholders(count) {
  return Array.from({ length: count }).fill("?").join(",");
}

export async function listTests() {
  const tests = await query(
    "SELECT id, title, description, type, duration, company, created_at as createdAt FROM tests ORDER BY created_at DESC",
  );

  if (tests.length === 0) {
    return [];
  }

  const ids = tests.map((t) => t.id);
  const qs = await query(
    `SELECT id, test_id as testId, text, type, options_json as optionsJson, correct_answer as correctAnswer, test_cases_json as testCasesJson
     FROM questions
     WHERE test_id IN (${placeholders(ids.length)})
     ORDER BY test_id ASC, id ASC`,
    ids,
  );

  const byTestId = new Map();
  for (const q of qs) {
    const arr = byTestId.get(q.testId) || [];
    
    // Helper function to safely parse JSON
    const safeParseJSON = (value) => {
      if (value === null || value === undefined || value === "") {
        return null;
      }
      if (typeof value === 'object') {
        return value; // Already parsed
      }
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('JSON parse error:', e, 'Value:', value);
        return null;
      }
    };
    
    arr.push({
      id: String(q.id),
      text: q.text,
      type: q.type,
      options: safeParseJSON(q.optionsJson),
      correctAnswer: q.correctAnswer || "",
      testCases: safeParseJSON(q.testCasesJson),
    });
    byTestId.set(q.testId, arr);
  }

  return tests.map((t) => ({
    id: String(t.id),
    title: t.title,
    description: t.description,
    type: t.type,
    duration: Number(t.duration),
    company: t.company,
    questions: byTestId.get(t.id) || [],
    createdAt: t.createdAt,
  }));
}

export async function createTest({ title, description, type, duration, company, questions }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      "INSERT INTO tests (title, description, type, duration, company) VALUES (?, ?, ?, ?, ?)",
      [title, description || "", type, duration, company || ""],
    );

    const testId = result.insertId;

    for (const q of questions) {
      await conn.execute(
        "INSERT INTO questions (test_id, text, type, options_json, correct_answer, test_cases_json) VALUES (?, ?, ?, ?, ?, ?)",
        [
          testId,
          q.text,
          q.type,
          q.type === "mcq" ? JSON.stringify(q.options || []) : null,
          q.type === "mcq" ? (q.correctAnswer || "") : null,
          q.type === "coding" && q.testCases ? JSON.stringify(q.testCases) : null,
        ],
      );
    }

    await conn.commit();
    return String(testId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteTest(testId) {
  await query("DELETE FROM tests WHERE id = ?", [testId]);
}
