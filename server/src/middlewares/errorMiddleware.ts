import { NextFunction, Request, Response } from "express";

export interface AppError extends Error {
  statusCode?: number;
  status?: number;
}

export function errorMiddleware(
  error: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("Unhandled server error:", error);

  const statusCode =
    typeof error.statusCode === "number"
      ? error.statusCode
      : typeof error.status === "number"
        ? error.status
        : 500;

  const safeStatusCode =
    statusCode >= 400 && statusCode < 600 ? statusCode : 500;

  const message =
    safeStatusCode === 500
      ? "Internal server error"
      : error.message || "Request failed";

  return res.status(safeStatusCode).json({
    success: false,
    message,
  });
}
