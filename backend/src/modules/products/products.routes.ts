import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { parseProductPhoto } from "../../middlewares/upload.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { productsController } from "./products.controller";
import {
  createProductSchema,
  productIdParamSchema,
  updateProductSchema,
} from "./products.schema";

export const productsRouter = Router();

productsRouter.use(authenticate);

productsRouter.get("/", asyncHandler(productsController.list));
productsRouter.get(
  "/:id",
  validate({ params: productIdParamSchema }),
  asyncHandler(productsController.getById),
);
productsRouter.post(
  "/",
  parseProductPhoto,
  validate({ body: createProductSchema }),
  asyncHandler(productsController.create),
);
productsRouter.put(
  "/:id",
  parseProductPhoto,
  validate({ params: productIdParamSchema, body: updateProductSchema }),
  asyncHandler(productsController.update),
);
productsRouter.delete(
  "/:id",
  validate({ params: productIdParamSchema }),
  asyncHandler(productsController.remove),
);
