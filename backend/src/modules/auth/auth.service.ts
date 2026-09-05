import { ConflictError, UnauthorizedError } from "../../utils/AppError";
import { signAccessToken } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import type { LoginInput, RegisterInput } from "./auth.schema";
import { userRepository } from "./user.repository";

export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    const token = signAccessToken({ sub: user.id, email: user.email });

    return { token, user: { id: user.id, email: user.email, name: user.name } };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValidPassword = await comparePassword(input.password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = signAccessToken({ sub: user.id, email: user.email });

    return { token, user: { id: user.id, email: user.email, name: user.name } };
  },

  async getMe(userId: string): Promise<{ id: string; email: string; name: string; createdAt: Date }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    return { id: user.id, email: user.email, name: user.name, createdAt: user.created_at };
  },
};
