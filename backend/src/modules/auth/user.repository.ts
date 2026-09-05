import { db } from "../../config/db";

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
}

const TABLE = "users";

export const userRepository = {
  async findByEmail(email: string): Promise<UserRecord | undefined> {
    return db<UserRecord>(TABLE).where({ email }).first();
  },

  async findById(id: string): Promise<UserRecord | undefined> {
    return db<UserRecord>(TABLE).where({ id }).first();
  },

  async create(data: { email: string; passwordHash: string; name: string }): Promise<UserRecord> {
    const [user] = await db<UserRecord>(TABLE)
      .insert({ email: data.email, password_hash: data.passwordHash, name: data.name })
      .returning("*");

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  },
};
