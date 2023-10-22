import express from "express";
import * as tempResourceController from "../controllers/tempResource";
import { adminAuthMiddleware } from "../middlewares/adminAuth";

const tempResourceRouter = express.Router();

// Protected(Auth + Admin) POST /temp-resources/:id/approve/ -> add a resource
tempResourceRouter.post(
  "/:id/approve",
  adminAuthMiddleware,
  tempResourceController.approveTempResource
);

// Protected(Auth + Admin) DELETE /temp-resources/:id -> delete a tempResource
tempResourceRouter.delete(
  "/:id",
  adminAuthMiddleware,
  tempResourceController.removeTempResource
);

// Protected(Auth + Admin) GET /temp-resources -> get all resources of a sub category
tempResourceRouter.get(
  "/",
  adminAuthMiddleware,
  tempResourceController.getTempResources
);

export default tempResourceRouter;
