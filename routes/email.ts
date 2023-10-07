import express from "express";
import * as emailController from "../controllers/email";
import { authMiddleware } from "../middlewares/auth";

const emailRouter = express.Router();

// Protected(Auth) GET /email/verify/:token -> to verify your email is yours
emailRouter.get("/verify/:token", authMiddleware, emailController.emailVerify);
// Protected(Auth) POST /email/resend-verify -> to resend verify email
emailRouter.post(
  "/resend-verify",
  authMiddleware,
  emailController.resendVerifyEmail
);

export default emailRouter;
