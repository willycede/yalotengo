import { db } from "../../config/db";

export interface CategoryRecord {
  id: string;
  user_id: string;
  name: string;
  created_at: Date;
}

const TABLE = "categories";

export const categoriesRepository = {
  async findAllByUser(userId: string, limit: number, offset: number): Promise<CategoryRecord[]> {
    return db<CategoryRecord>(TABLE)
      .where({ user_id: userId })
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);
  },

  async countByUser(userId: string): Promise<number> {
    const result = await db<CategoryRecord>(TABLE).where({ user_id: userId }).count<{ count: string }[]>("id as count");
    return Number(result[0]?.count ?? 0);
  },

  async findByIdAndUser(id: string, userId: string): Promise<CategoryRecord | undefined> {
    return db<CategoryRecord>(TABLE).where({ id, user_id: userId }).first();
  },

  async create(userId: string, name: string): Promise<CategoryRecord> {
    const [category] = await db<CategoryRecord>(TABLE).insert({ user_id: userId, name }).returning("*");

    if (!category) {
      throw new Error("Failed to create category");
    }

    return category;
  },

  async update(id: string, userId: string, name: string): Promise<CategoryRecord | undefined> {
    const [category] = await db<CategoryRecord>(TABLE)
      .where({ id, user_id: userId })
      .update({ name })
      .returning("*");

    return category;
  },

  async delete(id: string, userId: string): Promise<number> {
    return db<CategoryRecord>(TABLE).where({ id, user_id: userId }).delete();
  },
};
