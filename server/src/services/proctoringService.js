import { query } from "../db/pool.js";
import { ApiError } from "../utils/ApiError.js";

const VIOLATION_TYPES = Object.freeze({
  NO_FACE: "NO_FACE",
  MULTIPLE_FACES: "MULTIPLE_FACES",
  LOOKING_AWAY: "LOOKING_AWAY",
  TAB_SWITCH: "TAB_SWITCH",
  PHONE_DETECTED: "PHONE_DETECTED",
  AUDIO_VIOLATION: "AUDIO_VIOLATION",
  SCREEN_SHARE_STOPPED: "SCREEN_SHARE_STOPPED",
});

function clampInt(n, min, max) {
  const v = Number.isFinite(Number(n)) ? Number(n) : 0;
  return Math.max(min, Math.min(max, Math.trunc(v)));
}

// Lightweight scoring model (can be tuned later)
// - riskScore is cumulative sum of severity_score for active session
// - warning thresholds are count-based
function buildRiskScore(severitySum) {
  // Map severitySum -> 0..100
  // severitySum=0 => 0
  // severitySum >= 100 => 100
  return clampInt(severitySum, 0, 100);
}

function getRecommendation(riskScore) {
  if (riskScore >= 70) return { label: "High Risk", code: "HIGH_RISK" };
  if (riskScore >= 35) return { label: "Moderate Risk", code: "MODERATE_RISK" };
  return { label: "Safe", code: "SAFE" };
}

export async function startSession({ candidateId, assessmentId }) {
  // Ensure candidate exists (unique by user_id in schema, but we require id here)
  // If you want to auto-create candidate from user_id, that can be added later.

  const sessionResult = await query(
    `INSERT INTO proctoring_session (candidate_id, assessment_id, status)
     VALUES (?, ?, 'ACTIVE')`,
    [candidateId, assessmentId]
  );

  const sessionId = sessionResult.insertId;
  await query(`UPDATE proctoring_session SET risk_score = 0, total_warnings = 0 WHERE id = ?`, [sessionId]);

  return { sessionId };
}

export async function startSessionForUser({ userId, testId }) {
  const testRows = await query(
    `SELECT id, title, duration
     FROM tests
     WHERE id = ?`,
    [testId]
  );
  const test = testRows[0];
  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  await query(
    `INSERT INTO candidate (user_id)
     VALUES (?)
     ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
    [userId]
  );

  const candidateRows = await query(`SELECT id FROM candidate WHERE user_id = ?`, [userId]);
  const candidateId = candidateRows[0]?.id;
  if (!candidateId) {
    throw new ApiError(500, "Unable to create candidate profile");
  }

  let assessmentRows = await query(
    `SELECT id
     FROM assessment
     WHERE test_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    [test.id]
  );
  if (!assessmentRows[0]) {
    await query(
      `INSERT INTO assessment (test_id, title, duration)
       VALUES (?, ?, ?)`,
      [test.id, test.title, test.duration]
    );
    assessmentRows = await query(
      `SELECT id
       FROM assessment
       WHERE test_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [test.id]
    );
  }
  const assessmentId = assessmentRows[0]?.id;
  if (!assessmentId) {
    throw new ApiError(500, "Unable to create assessment profile");
  }

  await query(
    `UPDATE proctoring_session
     SET ended_at = NOW(), status = 'ENDED'
     WHERE candidate_id = ? AND assessment_id = ? AND status = 'ACTIVE'`,
    [candidateId, assessmentId]
  );

  const { sessionId } = await startSession({ candidateId, assessmentId });

  return {
    proctoringSessionId: sessionId,
    candidateId,
    assessmentId,
    riskScore: 0,
    totalWarnings: 0,
  };
}

export async function endSession({ sessionId, userId, isAdmin = false }) {
  if (userId) {
    const sessionRows = await query(
      `SELECT ps.id, c.user_id AS userId
       FROM proctoring_session ps
       JOIN candidate c ON c.id = ps.candidate_id
       WHERE ps.id = ?`,
      [sessionId]
    );
    const session = sessionRows[0];
    if (!session) {
      throw new ApiError(404, "Proctoring session not found");
    }
    if (!isAdmin && String(session.userId) !== String(userId)) {
      throw new ApiError(403, "Forbidden");
    }
  }

  await query(
    `UPDATE proctoring_session
     SET ended_at = NOW(), status = 'ENDED'
     WHERE id = ?`,
    [sessionId]
  );
  return { ok: true };
}

export async function logViolation({
  proctoringSessionId,
  userId,
  isAdmin = false,
  violationType,
  severityScore,
  metaJson,
  createdAt,
}) {
  if (!Object.values(VIOLATION_TYPES).includes(violationType)) {
    throw new Error(`Invalid violationType: ${violationType}`);
  }

  const sev = clampInt(severityScore, 0, 1000);
  let newWarnings = [];

  const sessionRows = await query(
    `SELECT ps.id, ps.candidate_id AS candidateId, ps.status, c.user_id AS userId
     FROM proctoring_session ps
     JOIN candidate c ON c.id = ps.candidate_id
     WHERE ps.id = ?`,
    [proctoringSessionId]
  );
  const session = sessionRows[0];
  if (!session) {
    throw new ApiError(404, "Proctoring session not found");
  }
  if (!isAdmin && String(session.userId) !== String(userId)) {
    throw new ApiError(403, "Forbidden");
  }
  if (session.status !== "ACTIVE") {
    throw new ApiError(409, "Proctoring session has ended");
  }

  const candidateId = session.candidateId;
  const encodedMetaJson = metaJson === undefined || metaJson === null ? null : JSON.stringify(metaJson);

  await query(
    `INSERT INTO violation (proctoring_session_id, candidate_id, violation_type, severity_score, meta_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?)` ,
    [proctoringSessionId, candidateId, violationType, sev, encodedMetaJson, createdAt ?? new Date()]
  );

  // Update risk score after insertion
  const rows = await query(
    `SELECT COALESCE(SUM(severity_score),0) AS severitySum
     FROM violation
     WHERE proctoring_session_id = ?`,
    [proctoringSessionId]
  );

  const severitySum = rows[0]?.severitySum ?? 0;
  const riskScore = buildRiskScore(severitySum);

  // Update warnings based on simple rule:
  // - WARNING_1 when >= warning1Count
  // - WARNING_2 when >= warning2Count
  // - AUTO_SUBMIT when >= autoSubmitCount
  // This controller leaves actual thresholds in env for later.
  const warningAgg = await query(
    `SELECT status FROM proctoring_session WHERE id = ?`,
    [proctoringSessionId]
  );
  const status = warningAgg[0]?.status;

  // Only create warnings for ACTIVE sessions
  if (status === "ACTIVE") {
    // defaults: WARNING_1 at 3 events, WARNING_2 at 6 events, AUTO_SUBMIT at 8 events
    const warning1Count = Number(process.env.PROCTOR_WARNING_1_COUNT || 3);
    const warning2Count = Number(process.env.PROCTOR_WARNING_2_COUNT || 6);
    const autoSubmitCount = Number(process.env.PROCTOR_WARNING_AUTOSUBMIT_COUNT || 8);

    const vCountRows = await query(
      `SELECT COUNT(*) AS violationCount
       FROM violation
       WHERE proctoring_session_id = ?`,
      [proctoringSessionId]
    );
    const violationCount = vCountRows[0]?.violationCount ?? 0;

    const warningToCreate = [];
    if (violationCount >= warning1Count) warningToCreate.push("WARNING_1");
    if (violationCount >= warning2Count) warningToCreate.push("WARNING_2");
    if (violationCount >= autoSubmitCount) warningToCreate.push("AUTO_SUBMIT");

    if (warningToCreate.length) {
      const existing = await query(
        `SELECT warning_level
         FROM warning
         WHERE proctoring_session_id = ?`,
        [proctoringSessionId]
      );
      const existingLevels = new Set(existing.map((r) => r.warning_level));

      for (const level of warningToCreate) {
        if (existingLevels.has(level)) continue;

        await query(
          `INSERT INTO warning (proctoring_session_id, candidate_id, warning_level, reason_violation_type, severity_score)
           VALUES (?, ?, ?, ?, ?)` ,
          [proctoringSessionId, candidateId, level, violationType, sev]
        );
        newWarnings.push(level);
      }
    }
  }

  const totals = await query(
    `SELECT COALESCE(COUNT(*),0) AS totalWarnings
     FROM warning
     WHERE proctoring_session_id = ?`,
    [proctoringSessionId]
  );
  const totalWarnings = totals[0]?.totalWarnings ?? 0;

  await query(
    `UPDATE proctoring_session
     SET risk_score = ?, total_warnings = ?
     WHERE id = ?`,
    [riskScore, totalWarnings, proctoringSessionId]
  );

  return {
    riskScore,
    totalWarnings,
    warnings: newWarnings || [],
    shouldAutoSubmit: (newWarnings || []).includes("AUTO_SUBMIT") || riskScore >= 95,
  };
}

export async function getCandidateViolations({ candidateId }) {
  return await query(
    `SELECT v.id, v.proctoring_session_id, v.violation_type, v.severity_score, v.meta_json, v.created_at
     FROM violation v
     WHERE v.candidate_id = ?
     ORDER BY v.created_at DESC
     LIMIT 500`,
    [candidateId]
  );
}

export async function listCandidateReports() {
  const sessions = await query(
    `SELECT c.id AS candidate_id, u.name, u.email,
            ps.id AS proctoring_session_id, ps.assessment_id, a.title AS assessment_title,
            a.test_id, ps.started_at, ps.ended_at, ps.status, ps.risk_score, ps.total_warnings,
            COALESCE(v.total_violations, 0) AS total_violations,
            v.last_violation_at
     FROM candidate c
     JOIN users u ON u.id = c.user_id
     LEFT JOIN proctoring_session ps ON ps.id = (
       SELECT latest.id
       FROM proctoring_session latest
       WHERE latest.candidate_id = c.id
       ORDER BY latest.started_at DESC, latest.id DESC
       LIMIT 1
     )
     LEFT JOIN assessment a ON a.id = ps.assessment_id
     LEFT JOIN (
       SELECT candidate_id, proctoring_session_id, COUNT(*) AS total_violations, MAX(created_at) AS last_violation_at
       FROM violation
       GROUP BY candidate_id, proctoring_session_id
     ) v ON v.candidate_id = c.id AND v.proctoring_session_id = ps.id
     ORDER BY COALESCE(ps.started_at, c.created_at) DESC`
  );

  return sessions.map((row) => {
    const riskScore = clampInt(row.risk_score ?? 0, 0, 100);
    return {
      candidateId: String(row.candidate_id),
      name: row.name,
      email: row.email,
      proctoringSessionId: row.proctoring_session_id ? String(row.proctoring_session_id) : null,
      assessmentId: row.assessment_id ? String(row.assessment_id) : null,
      assessmentTitle: row.assessment_title || "No proctored test yet",
      testId: row.test_id ? String(row.test_id) : null,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      status: row.status || "NOT_STARTED",
      riskScore,
      totalWarnings: Number(row.total_warnings || 0),
      totalViolations: Number(row.total_violations || 0),
      lastViolationAt: row.last_violation_at,
      recommendation: getRecommendation(riskScore),
    };
  });
}

export async function getCandidateReport({ candidateId }) {
  const candidateRows = await query(
    `SELECT c.id AS candidate_id, u.name, u.email
     FROM candidate c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = ?`,
    [candidateId]
  );

  const candidate = candidateRows[0];
  if (!candidate) {
    return null;
  }

  const sessionRows = await query(
    `SELECT ps.id AS proctoring_session_id, ps.assessment_id, ps.started_at, ps.ended_at, ps.status,
            ps.risk_score, ps.total_warnings
     FROM proctoring_session ps
     WHERE ps.candidate_id = ?
     ORDER BY ps.started_at DESC
     LIMIT 1`,
    [candidateId]
  );

  const session = sessionRows[0];

  const violations = await query(
    `SELECT v.violation_type, v.severity_score, v.created_at
     FROM violation v
     WHERE v.candidate_id = ?
     ORDER BY v.created_at DESC
     LIMIT 200`,
    [candidateId]
  );

  const riskScore = clampInt(session?.risk_score ?? 0, 0, 100);
  const rec = getRecommendation(riskScore);

  return {
    candidate: {
      candidateId: candidate.candidate_id,
      name: candidate.name,
      email: candidate.email,
    },
    proctoringSession: session
      ? {
          proctoringSessionId: session.proctoring_session_id,
          assessmentId: session.assessment_id,
          startedAt: session.started_at,
          endedAt: session.ended_at,
          status: session.status,
        }
      : null,
    totalViolations: violations.length,
    riskScore,
    recommendation: rec,
    violations,
  };
}

