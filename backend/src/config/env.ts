import "dotenv/config";
import { z } from "zod";

/**
 * A variable declared but left blank in `.env` arrives as "", which `.optional()`
 * would still reject. Blank means "not configured", same as absent.
 */
function optional(schema: z.ZodString) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    schema.optional(),
  );
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("*"),
  /**
   * Railway Bucket (S3-compatible). Optional so the API still boots without a
   * bucket configured — everything works except photo upload, which then fails
   * with a clear message instead of taking the whole service down.
   */
  STORAGE_ENDPOINT: optional(z.string().url("STORAGE_ENDPOINT must be a URL")),
  STORAGE_REGION: optional(z.string().min(1)),
  STORAGE_BUCKET: optional(z.string().min(1)),
  STORAGE_ACCESS_KEY_ID: optional(z.string().min(1)),
  STORAGE_SECRET_ACCESS_KEY: optional(z.string().min(1)),
});

/**
 * Railway injects a connected Bucket's credentials under bare names
 * (`ENDPOINT`, `BUCKET`, …). Accepting those as a fallback means the deployed
 * service works whether the variables are wired through as `STORAGE_*` or left
 * with Railway's defaults — one less thing to get wrong at deploy time.
 */
const rawEnv = {
  ...process.env,
  STORAGE_ENDPOINT: process.env["STORAGE_ENDPOINT"] || process.env["ENDPOINT"],
  STORAGE_REGION: process.env["STORAGE_REGION"] || process.env["REGION"],
  STORAGE_BUCKET: process.env["STORAGE_BUCKET"] || process.env["BUCKET"],
  STORAGE_ACCESS_KEY_ID: process.env["STORAGE_ACCESS_KEY_ID"] || process.env["ACCESS_KEY_ID"],
  STORAGE_SECRET_ACCESS_KEY:
    process.env["STORAGE_SECRET_ACCESS_KEY"] || process.env["SECRET_ACCESS_KEY"],
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;

/** True only when every bucket credential is present. */
export const isStorageConfigured =
  Boolean(env.STORAGE_ENDPOINT) &&
  Boolean(env.STORAGE_REGION) &&
  Boolean(env.STORAGE_BUCKET) &&
  Boolean(env.STORAGE_ACCESS_KEY_ID) &&
  Boolean(env.STORAGE_SECRET_ACCESS_KEY);

if (!isStorageConfigured) {
  console.warn("Storage bucket is not configured — product photo upload is disabled.");
}
