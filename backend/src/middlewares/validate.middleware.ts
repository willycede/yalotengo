import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { BadRequestError } from "../utils/AppError";

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        throw new BadRequestError(formatZodError(result.error.flatten().fieldErrors));
      }
      req.body = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        throw new BadRequestError(formatZodError(result.error.flatten().fieldErrors));
      }
      req.query = result.data as typeof req.query;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        throw new BadRequestError(formatZodError(result.error.flatten().fieldErrors));
      }
      req.params = result.data as typeof req.params;
    }

    next();
  };
}

function formatZodError(fieldErrors: Record<string, string[] | undefined>): string {
  const [firstField] = Object.keys(fieldErrors);
  if (!firstField) return "Invalid request";
  const messages = fieldErrors[firstField];
  return messages?.[0] ?? "Invalid request";
}
