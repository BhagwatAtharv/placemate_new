import { ApiError } from "../utils/ApiError.js";

export function errorHandler(err, req, res, next) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err instanceof ApiError ? err.message : "Internal Server Error";

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: message,
  });
}
