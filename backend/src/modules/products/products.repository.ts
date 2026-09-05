import { db } from "../../config/db";

export interface ProductRecord {
  id: string;
  category_id: string;
  name: string;
  photo_url: string | null;
  stock: number;
  location: string | null;
  /**
   * NUMERIC(12,2). The pg driver returns numerics as strings to avoid losing
   * precision, so clients must parse this rather than assume a number.
   */
  unit_price: string | null;
  created_at: Date;
  updated_at: Date;
}

const TABLE = "products";
const CATEGORIES_TABLE = "categories";

function byUserSubquery(userId: string) {
  return db(CATEGORIES_TABLE).select("id").where({ user_id: userId });
}

export const productsRepository = {
  async findAllByCategory(categoryId: string): Promise<ProductRecord[]> {
    return db<ProductRecord>(TABLE).where({ category_id: categoryId }).orderBy("created_at", "desc");
  },

  async findAllByUser(userId: string, limit: number, offset: number): Promise<ProductRecord[]> {
    return db<ProductRecord>(TABLE)
      .whereIn("category_id", byUserSubquery(userId))
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);
  },

  async countByUser(userId: string): Promise<number> {
    const result = await db<ProductRecord>(TABLE)
      .whereIn("category_id", byUserSubquery(userId))
      .count<{ count: string }[]>("id as count");
    return Number(result[0]?.count ?? 0);
  },

  async findByIdAndUser(id: string, userId: string): Promise<ProductRecord | undefined> {
    return db<ProductRecord>(TABLE).where({ id }).whereIn("category_id", byUserSubquery(userId)).first();
  },

  async create(data: {
    categoryId: string;
    name: string;
    photoUrl?: string | undefined;
    stock: number;
    location?: string | undefined;
    unitPrice?: number | undefined;
  }): Promise<ProductRecord> {
    const [product] = await db<ProductRecord>(TABLE)
      .insert({
        category_id: data.categoryId,
        name: data.name,
        photo_url: data.photoUrl ?? null,
        stock: data.stock,
        location: data.location ?? null,
        unit_price: data.unitPrice?.toString() ?? null,
      })
      .returning("*");

    if (!product) {
      throw new Error("Failed to create product");
    }

    return product;
  },

  async update(
    id: string,
    userId: string,
    data: Partial<{
      categoryId: string;
      name: string;
      photoUrl: string | null;
      stock: number;
      location: string | null;
      unitPrice: number | null;
    }>,
  ): Promise<ProductRecord | undefined> {
    const patch: Record<string, unknown> = { updated_at: db.fn.now() };
    if (data.categoryId !== undefined) patch["category_id"] = data.categoryId;
    if (data.name !== undefined) patch["name"] = data.name;
    if (data.photoUrl !== undefined) patch["photo_url"] = data.photoUrl;
    if (data.stock !== undefined) patch["stock"] = data.stock;
    if (data.location !== undefined) patch["location"] = data.location;
    // `null` clears the price; `undefined` leaves it untouched.
    if (data.unitPrice !== undefined) patch["unit_price"] = data.unitPrice?.toString() ?? null;

    const [product] = await db<ProductRecord>(TABLE)
      .where({ id })
      .whereIn("category_id", byUserSubquery(userId))
      .update(patch)
      .returning("*");

    return product;
  },

  async delete(id: string, userId: string): Promise<number> {
    return db<ProductRecord>(TABLE).where({ id }).whereIn("category_id", byUserSubquery(userId)).delete();
  },
};
