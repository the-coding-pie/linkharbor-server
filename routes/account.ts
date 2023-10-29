import express from "express";
import * as accountController from "../controllers/account";
import { authMiddleware } from "../middlewares/auth";
import { multerUploadSingle } from "../middlewares/multerUploadSingle";

const accountRouter = express.Router();

// Protected(Auth) PUT /accounts -> update user info
accountRouter.put(
  "/",
  authMiddleware,
  function (req, res, next) {
    multerUploadSingle(req, res, next, "profile");
  },
  accountController.updateAccount
);

// POST /accounts/forgot-password -> to get link for renew password
accountRouter.post(`/forgot-password`, accountController.forgotPassword);
// POST /accounts/reset-password/:token -> to renew password
accountRouter.post(`/reset-password/:token`, accountController.resetPassword);

export default accountRouter;
