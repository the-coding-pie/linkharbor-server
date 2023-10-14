import express from "express";
import authRouter from "./auth";
import emailRouter from "./email";
import accountRouter from "./account";
import resourceRouter from "./resource";
import categoryRouter from "./category";
import tempResourceRouter from "./tempResource";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/email", emailRouter);
rootRouter.use("/accounts", accountRouter);
rootRouter.use("/resources", resourceRouter);
rootRouter.use("/temp-resources", tempResourceRouter);
rootRouter.use("/categories", categoryRouter);

export default rootRouter;
