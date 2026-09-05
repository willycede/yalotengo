import type { Request, Response } from "express";
import { UnauthorizedError } from "../../utils/AppError";
import { getPaginationParams } from "../../utils/pagination";
import { categoriesService } from "./categories.service";
import type { CreateCategoryInput, UpdateCategoryInput } from "./categories.schema";

function requireUserId(req: Request): string {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user.id;
}

export const categoriesController = {
  async list(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const pagination = getPaginationParams(req);
    const result = await categoriesService.list(userId, pagination);
    res.status(200).json(result);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const category = await categoriesService.getByIdWithProducts(req.params["id"] as string, userId);
    res.status(200).json(category);
  },

  async create(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const body = req.body as CreateCategoryInput;
    const category = await categoriesService.create(userId, body.name);
    res.status(201).json(category);
  },

  async update(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const body = req.body as UpdateCategoryInput;
    const category = await categoriesService.update(req.params["id"] as string, userId, body.name);
    res.status(200).json(category);
  },

  async remove(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    await categoriesService.remove(req.params["id"] as string, userId);
    res.status(204).send();
  },
};
