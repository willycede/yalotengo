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

/** First non-empty value wins. */
function pick(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim() !== "") {
      return value;
    }
  }
  return undefined;
}

/**
 * Bucket credentials arrive under different names depending on how the bucket
 * was wired up in Railway: bare names (`ENDPOINT`, `BUCKET`, …) when referenced
 * manually, or `AWS_*` when using Railway's AWS SDK preset. Accepting all three
 * spellings means the deployed service works regardless of which path was
 * taken — one less thing to get wrong at deploy time.
 */
const rawEnv = {
  ...process.env,
  STORAGE_ENDPOINT: pick(
    "STORAGE_ENDPOINT",
    "ENDPOINT",
    "AWS_ENDPOINT_URL_S3",
    "AWS_ENDPOINT_URL",
  ),
  STORAGE_REGION: pick("STORAGE_REGION", "REGION", "AWS_REGION", "AWS_DEFAULT_REGION"),
  STORAGE_BUCKET: pick("STORAGE_BUCKET", "BUCKET", "AWS_BUCKET", "S3_BUCKET"),
  STORAGE_ACCESS_KEY_ID: pick("STORAGE_ACCESS_KEY_ID", "ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID"),
  STORAGE_SECRET_ACCESS_KEY: pick(
    "STORAGE_SECRET_ACCESS_KEY",
    "SECRET_ACCESS_KEY",
    "AWS_SECRET_ACCESS_KEY",
  ),
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
