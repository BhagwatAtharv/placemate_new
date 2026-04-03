import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { createUser, findUserByEmail, findUserById } from "../models/userModel.js";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "admin"]).default("student"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  return jwt.sign({ userId: user.id, role: user.role, name: user.name, email: user.email }, env.jwtSecret, {
    expiresIn: "7d",
  });
}

export async function register(req, res, next) {
  try {
    const body = registerSchema.parse(req.body);

    const existing = await findUserByEmail(body.email);
    if (existing) {
      throw new ApiError(409, "Email already exists");
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await createUser({
      name: body.name,
      email: body.email,
      passwordHash,
      role: body.role,
    });

    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const body = loginSchema.parse(req.body);

    const user = await findUserByEmail(body.email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = signToken({ id: user.id, role: user.role, name: user.name, email: user.email });

    res.json({
      user: { id: String(user.id), name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await findUserById(req.auth.userId);
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }
    res.json({ user: { id: String(user.id), name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}
