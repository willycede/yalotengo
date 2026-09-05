import type { Request, Response } from "express";
import { UnauthorizedError } from "../../utils/AppError";
import { uploadProductPhoto } from "../../utils/objectStorage";
import { getPaginationParams } from "../../utils/pagination";
import { productsService } from "./products.service";
import type { CreateProductInput, UpdateProductInput } from "./products.schema";

function requireUserId(req: Request): string {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user.id;
}

export const productsController = {
  async list(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const pagination = getPaginationParams(req);
    const result = await productsService.list(userId, pagination);
    res.status(200).json(result);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const product = await productsService.getById(req.params["id"] as string, userId);
    res.status(200).json(product);
  },

  async create(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    // Upload returns the object key; the service signs it back into a URL.
    const photoKey = req.file ? await uploadProductPhoto(req.file.buffer) : undefined;
    const product = await productsService.create(userId, req.body as CreateProductInput, photoKey);
    res.status(201).json(product);
  },

  async update(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const photoKey = req.file ? await uploadProductPhoto(req.file.buffer) : undefined;
    const product = await productsService.update(
      req.params["id"] as string,
      userId,
      req.body as UpdateProductInput,
      photoKey,
    );
    res.status(200).json(product);
  },

  async remove(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    await productsService.remove(req.params["id"] as string, userId);
    res.status(204).send();
  },
};
