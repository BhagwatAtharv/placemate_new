import { query } from "../db/pool.js";

export async function findUserByEmail(email) {
  const rows = await query(
    "SELECT id, name, email, password_hash as passwordHash, role, created_at as createdAt FROM users WHERE email = ? LIMIT 1",
    [email],
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const rows = await query(
    "SELECT id, name, email, role, created_at as createdAt FROM users WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] || null;
}

export async function createUser({ name, email, passwordHash, role }) {
  const result = await query(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [name, email, passwordHash, role],
  );
  return { id: String(result.insertId), name, email, role };
}
