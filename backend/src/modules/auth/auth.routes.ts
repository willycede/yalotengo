import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), asyncHandler(authController.register));
authRouter.post("/login", validate({ body: loginSchema }), asyncHandler(authController.login));
authRouter.get("/me", authenticate, asyncHandler(authController.me));
