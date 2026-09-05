import type { Request, Response } from "express";
import { UnauthorizedError } from "../../utils/AppError";
import { authService } from "./auth.service";
import type { LoginInput, RegisterInput } from "./auth.schema";

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body as RegisterInput);
    res.status(201).json(result);
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body as LoginInput);
    res.status(200).json(result);
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const user = await authService.getMe(req.user.id);
    res.status(200).json(user);
  },
};
