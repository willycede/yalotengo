import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { categoriesController } from "./categories.controller";
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from "./categories.schema";

export const categoriesRouter = Router();

categoriesRouter.use(authenticate);

categoriesRouter.get("/", asyncHandler(categoriesController.list));
categoriesRouter.get(
  "/:id",
  validate({ params: categoryIdParamSchema }),
  asyncHandler(categoriesController.getById),
);
categoriesRouter.post("/", validate({ body: createCategorySchema }), asyncHandler(categoriesController.create));
categoriesRouter.put(
  "/:id",
  validate({ params: categoryIdParamSchema, body: updateCategorySchema }),
  asyncHandler(categoriesController.update),
);
categoriesRouter.delete(
  "/:id",
  validate({ params: categoryIdParamSchema }),
  asyncHandler(categoriesController.remove),
);
