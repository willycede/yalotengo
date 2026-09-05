import { S3Client } from "@aws-sdk/client-s3";
import { env, isStorageConfigured } from "./env";

/**
 * Railway Buckets speak the S3 API, so the standard AWS SDK works unchanged.
 * `forcePathStyle` is required: Railway addresses buckets as
 * `<endpoint>/<bucket>` rather than the virtual-host style AWS uses.
 *
 * Built lazily so the service boots without bucket credentials; only photo
 * operations need them.
 */
let client: S3Client | null = null;

export function getS3(): S3Client {
  if (!isStorageConfigured) {
    throw new Error("Storage bucket is not configured");
  }

  client ??= new S3Client({
    region: env.STORAGE_REGION as string,
    endpoint: env.STORAGE_ENDPOINT as string,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.STORAGE_ACCESS_KEY_ID as string,
      secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY as string,
    },
  });

  return client;
}

export function getBucket(): string {
  return env.STORAGE_BUCKET as string;
}
