import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { isStorageConfigured } from "../config/env";
import { getBucket, getS3 } from "../config/storage";
import { BadRequestError } from "./AppError";

const PRODUCTS_PREFIX = "products";

/** Phone photos are far larger than a product thumbnail needs. */
const MAX_DIMENSION = 1200;
const WEBP_QUALITY = 80;

/**
 * Presigned URLs are how a private bucket serves images: the browser fetches
 * straight from the bucket, so Railway charges no egress. They expire, which is
 * why the database stores the object KEY and the URL is signed on every read.
 * Seven days comfortably outlives any open session while staying well under
 * Railway's 90-day ceiling.
 */
const URL_TTL_SECONDS = 7 * 24 * 60 * 60;

/**
 * Uploads a product photo and returns its object key.
 *
 * Railway Buckets do no image processing, so resizing happens here: a 4 MB
 * phone photo becomes a ~100 KB WebP, which matters a lot on mobile data.
 */
export async function uploadProductPhoto(fileBuffer: Buffer): Promise<string> {
  if (!isStorageConfigured) {
    throw new BadRequestError("Photo storage is not configured on this server");
  }

  let optimised: Buffer;
  try {
    optimised = await sharp(fileBuffer)
      .rotate() // Honour EXIF orientation before metadata is stripped.
      .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch (error) {
    console.error("Failed to process photo:", error);
    throw new BadRequestError("Photo could not be processed");
  }

  const key = `${PRODUCTS_PREFIX}/${randomUUID()}.webp`;

  try {
    await getS3().send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: key,
        Body: optimised,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (error) {
    // Log the real cause server-side; the client gets a generic message.
    console.error("Failed to upload photo to bucket:", error);
    throw new BadRequestError("Failed to upload photo");
  }

  return key;
}

/**
 * Turns a stored value into something the client can load.
 *
 * Absolute URLs pass through untouched so photos stored before the move to
 * bucket storage keep working; bare keys get a fresh presigned URL.
 */
export async function resolvePhotoUrl(stored: string | null): Promise<string | null> {
  if (!stored) {
    return null;
  }
  if (stored.startsWith("http://") || stored.startsWith("https://")) {
    return stored;
  }
  if (!isStorageConfigured) {
    return null;
  }

  try {
    return await getSignedUrl(getS3(), new GetObjectCommand({ Bucket: getBucket(), Key: stored }), {
      expiresIn: URL_TTL_SECONDS,
    });
  } catch (error) {
    // A missing photo must never break the product listing.
    console.error("Failed to sign photo URL:", error);
    return null;
  }
}

/** Best-effort cleanup; a failure here must not fail the user's request. */
export async function deleteProductPhoto(stored: string | null): Promise<void> {
  if (!stored || stored.startsWith("http") || !isStorageConfigured) {
    return;
  }

  try {
    await getS3().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: stored }));
  } catch (error) {
    console.error("Failed to delete photo from bucket:", error);
  }
}
