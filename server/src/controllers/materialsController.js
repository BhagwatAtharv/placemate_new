import { z } from "zod";
import { createMaterial, deleteMaterial, listMaterials } from "../models/materialModel.js";

const createMaterialSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  type: z.enum(["pdf", "video", "article"]),
  url: z.string().optional(),
  description: z.string().optional(),
});

export async function getMaterials(req, res, next) {
  try {
    const materials = await listMaterials();
    res.json({ materials });
  } catch (err) {
    next(err);
  }
}

export async function postMaterial(req, res, next) {
  try {
    const body = createMaterialSchema.parse(req.body);
    const id = await createMaterial(body);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

export async function removeMaterial(req, res, next) {
  try {
    const id = req.params.id;
    await deleteMaterial(id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
