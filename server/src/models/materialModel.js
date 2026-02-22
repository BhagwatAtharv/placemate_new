import { query } from "../db/pool.js";

export async function listMaterials() {
  const rows = await query(
    "SELECT id, title, company, type, url, description, created_at as createdAt FROM study_materials ORDER BY created_at DESC",
  );

  return rows.map((m) => ({
    id: String(m.id),
    title: m.title,
    company: m.company,
    type: m.type,
    url: m.url,
    description: m.description,
    createdAt: m.createdAt,
  }));
}

export async function createMaterial({ title, company, type, url, description }) {
  const result = await query(
    "INSERT INTO study_materials (title, company, type, url, description) VALUES (?, ?, ?, ?, ?)",
    [title, company, type, url || "", description || ""],
  );
  return String(result.insertId);
}

export async function deleteMaterial(id) {
  await query("DELETE FROM study_materials WHERE id = ?", [id]);
}
