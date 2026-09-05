import type { PaginationParams } from "../../utils/pagination";
import { buildPaginatedResult } from "../../utils/pagination";
import { ConflictError, NotFoundError } from "../../utils/AppError";
import { productsRepository } from "../products/products.repository";
import { withSignedPhotos } from "../products/products.service";
import { categoriesRepository, type CategoryRecord } from "./categories.repository";

const UNIQUE_VIOLATION_CODE = "23505";

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === UNIQUE_VIOLATION_CODE;
}

export const categoriesService = {
  async list(userId: string, pagination: PaginationParams) {
    const [categories, total] = await Promise.all([
      categoriesRepository.findAllByUser(userId, pagination.limit, pagination.offset),
      categoriesRepository.countByUser(userId),
    ]);

    return buildPaginatedResult(categories, total, pagination);
  },

  async getByIdWithProducts(id: string, userId: string) {
    const category = await categoriesRepository.findByIdAndUser(id, userId);
    if (!category) {
      throw new NotFoundError("Category");
    }

    const products = await productsRepository.findAllByCategory(category.id);

    // Embedded products need signed photo URLs just like the products endpoints.
    return { ...category, products: await withSignedPhotos(products) };
  },

  async create(userId: string, name: string): Promise<CategoryRecord> {
    try {
      return await categoriesRepository.create(userId, name);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictError("A category with this name already exists");
      }
      throw err;
    }
  },

  async update(id: string, userId: string, name: string): Promise<CategoryRecord> {
    try {
      const category = await categoriesRepository.update(id, userId, name);
      if (!category) {
        throw new NotFoundError("Category");
      }
      return category;
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictError("A category with this name already exists");
      }
      throw err;
    }
  },

  async remove(id: string, userId: string): Promise<void> {
    const deletedCount = await categoriesRepository.delete(id, userId);
    if (deletedCount === 0) {
      throw new NotFoundError("Category");
    }
  },
};
