import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { BadRequestError } from "../utils/AppError";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(new BadRequestError("Photo must be a JPEG, PNG or WebP image"));
    return;
  }
  callback(null, true);
}

export const parseProductPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
}).single("photo");
