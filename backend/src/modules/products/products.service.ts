import { NotFoundError } from "../../utils/AppError";
import { deleteProductPhoto, resolvePhotoUrl } from "../../utils/objectStorage";
import type { PaginationParams } from "../../utils/pagination";
import { buildPaginatedResult } from "../../utils/pagination";
import { categoriesRepository } from "../categories/categories.repository";
import type { CreateProductInput, UpdateProductInput } from "./products.schema";
import { productsRepository, type ProductRecord } from "./products.repository";

async function assertCategoryOwnership(categoryId: string, userId: string): Promise<void> {
  const category = await categoriesRepository.findByIdAndUser(categoryId, userId);
  if (!category) {
    throw new NotFoundError("Category");
  }
}

/**
 * The bucket is private, so `photo_url` holds an object KEY and the browser
 * needs a freshly signed URL. Signing happens on read — never at write time —
 * because presigned URLs expire and a stored one would eventually 403.
 *
 * Exported so the categories module can present its embedded products the
 * same way.
 */
export async function withSignedPhoto(product: ProductRecord): Promise<ProductRecord> {
  return { ...product, photo_url: await resolvePhotoUrl(product.photo_url) };
}

export async function withSignedPhotos(products: ProductRecord[]): Promise<ProductRecord[]> {
  // Signing is a local HMAC, not a network call, so doing it in parallel is cheap.
  return Promise.all(products.map(withSignedPhoto));
}

export const productsService = {
  async list(userId: string, pagination: PaginationParams) {
    const [products, total] = await Promise.all([
      productsRepository.findAllByUser(userId, pagination.limit, pagination.offset),
      productsRepository.countByUser(userId),
    ]);

    return buildPaginatedResult(await withSignedPhotos(products), total, pagination);
  },

  async getById(id: string, userId: string): Promise<ProductRecord> {
    const product = await productsRepository.findByIdAndUser(id, userId);
    if (!product) {
      throw new NotFoundError("Product");
    }
    return withSignedPhoto(product);
  },

  async create(userId: string, input: CreateProductInput, photoKey?: string): Promise<ProductRecord> {
    await assertCategoryOwnership(input.categoryId, userId);

    const product = await productsRepository.create({
      categoryId: input.categoryId,
      name: input.name,
      photoUrl: photoKey,
      stock: input.stock,
      location: input.location,
      unitPrice: input.unitPrice,
    });

    return withSignedPhoto(product);
  },

  async update(
    id: string,
    userId: string,
    input: UpdateProductInput,
    photoKey?: string,
  ): Promise<ProductRecord> {
    if (input.categoryId) {
      await assertCategoryOwnership(input.categoryId, userId);
    }

    // Captured before the update so the replaced file can be cleaned up after.
    const existing = photoKey !== undefined ? await productsRepository.findByIdAndUser(id, userId) : undefined;

    const product = await productsRepository.update(id, userId, {
      ...input,
      ...(photoKey !== undefined ? { photoUrl: photoKey } : {}),
    });
    if (!product) {
      throw new NotFoundError("Product");
    }

    if (existing?.photo_url && existing.photo_url !== photoKey) {
      await deleteProductPhoto(existing.photo_url);
    }

    return withSignedPhoto(product);
  },

  async remove(id: string, userId: string): Promise<void> {
    // Read first so the object can be removed once the row is gone.
    const product = await productsRepository.findByIdAndUser(id, userId);

    const deletedCount = await productsRepository.delete(id, userId);
    if (deletedCount === 0) {
      throw new NotFoundError("Product");
    }

    // Without this, deleted products would leak storage forever.
    await deleteProductPhoto(product?.photo_url ?? null);
  },
};
