import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { AppError } from "../utils/AppError";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: "Route not found" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Photo must be 5MB or smaller" : err.message;
    res.status(400).json({ error: message });
    return;
  }

  // Unexpected error: log full detail server-side, return a generic message to the client.
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
}
