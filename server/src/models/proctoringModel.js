import { query } from "../db/pool.js";

export async function insertSession({ candidateId, assessmentId }) {
  return await query(
    `INSERT INTO proctoring_session (candidate_id, assessment_id, status)
     VALUES (?, ?, 'ACTIVE')`,
    [candidateId, assessmentId]
  );
}

export async function setSessionEnded({ sessionId }) {
  await query(
    `UPDATE proctoring_session
     SET ended_at = NOW(), status = 'ENDED'
     WHERE id = ?`,
    [sessionId]
  );
}

export async function insertViolation({
  proctoringSessionId,
  candidateId,
  violationType,
  severityScore,
  metaJson,
  createdAt,
}) {
  return await query(
    `INSERT INTO violation (proctoring_session_id, candidate_id, violation_type, severity_score, meta_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [proctoringSessionId, candidateId, violationType, severityScore, metaJson ?? null, createdAt]
  );
}

export async function sumViolationSeverity({ proctoringSessionId }) {
  const rows = await query(
    `SELECT COALESCE(SUM(severity_score),0) AS severitySum
     FROM violation
     WHERE proctoring_session_id = ?`,
    [proctoringSessionId]
  );
  return rows[0]?.severitySum ?? 0;
}

export async function countViolations({ proctoringSessionId }) {
  const rows = await query(
    `SELECT COUNT(*) AS violationCount
     FROM violation
     WHERE proctoring_session_id = ?`,
    [proctoringSessionId]
  );
  return rows[0]?.violationCount ?? 0;
}

export async function listExistingWarnings({ proctoringSessionId }) {
  return await query(
    `SELECT warning_level
     FROM warning
     WHERE proctoring_session_id = ?`,
    [proctoringSessionId]
  );
}

export async function insertWarning({ proctoringSessionId, candidateId, warningLevel, reasonViolationType, severityScore }) {
  return await query(
    `INSERT INTO warning (proctoring_session_id, candidate_id, warning_level, reason_violation_type, severity_score)
     VALUES (?, ?, ?, ?, ?)`,
    [proctoringSessionId, candidateId, warningLevel, reasonViolationType ?? null, severityScore]
  );
}

export async function countWarnings({ proctoringSessionId }) {
  const rows = await query(
    `SELECT COALESCE(COUNT(*),0) AS totalWarnings
     FROM warning
     WHERE proctoring_session_id = ?`,
    [proctoringSessionId]
  );
  return rows[0]?.totalWarnings ?? 0;
}

export async function updateSessionScores({ proctoringSessionId, riskScore, totalWarnings }) {
  await query(
    `UPDATE proctoring_session
     SET risk_score = ?, total_warnings = ?
     WHERE id = ?`,
    [riskScore, totalWarnings, proctoringSessionId]
  );
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

export async function getCandidateReportBase({ candidateId }) {
  const candidateRows = await query(
    `SELECT c.id AS candidate_id, u.name, u.email
     FROM candidate c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = ?`,
    [candidateId]
  );

  const candidate = candidateRows[0];
  if (!candidate) return null;

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

  return { candidate, session, violations };
}

