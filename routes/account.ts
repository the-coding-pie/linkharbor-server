import express from "express";
import * as accountController from "../controllers/account";

const accountRouter = express.Router();

// POST /accounts/forgot-password -> to get link for renew password
accountRouter.post(`/forgot-password`, accountController.forgotPassword);
// POST /accounts/reset-password/:token -> to renew password
accountRouter.post(`/reset-password/:token`, accountController.resetPassword);

export default accountRouter;
