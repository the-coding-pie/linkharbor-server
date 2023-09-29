import express from "express";
import * as authController from "../controllers/auth";

const authRouter = express.Router();

// POST -> /auth/register -> register route
authRouter.post("/register", authController.registerUser);
// POST -> /auth/login -> login route
authRouter.post("/login", authController.loginUser);
// POST -> /auth/refresh -> to get new access token
authRouter.post("/refresh", authController.refreshToken);
// POST /auth/google -> google oauth
authRouter.post("/google", authController.googleAuth);

export default authRouter;
