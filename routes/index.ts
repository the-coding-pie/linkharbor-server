import express from "express";
import authRouter from "./auth";
import emailRouter from "./email";
import accountRouter from "./account";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/email", emailRouter);
rootRouter.use("/accounts", accountRouter);

export default rootRouter;
