import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "Unauthorized"));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.auth = payload;
    return next();
  } catch {
    return next(new ApiError(401, "Unauthorized"));
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.auth?.role) {
      return next(new ApiError(401, "Unauthorized"));
    }
    if (req.auth.role !== role) {
      return next(new ApiError(403, "Forbidden"));
    }
    return next();
  };
}
