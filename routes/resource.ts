import express from "express";
import * as resourceController from "../controllers/resource";
import { authMiddleware } from "../middlewares/auth";
import { emailVerifiedMiddleware } from "../middlewares/emailVerified";

const resourceRouter = express.Router();

// Protected(Auth) POST /resources -> add a resource
resourceRouter.post(
  "/",
  authMiddleware,
  emailVerifiedMiddleware,
  resourceController.addResource
);

// GET /resources -> get all resources of a sub category
resourceRouter.get("/:subCategoryId", resourceController.getResources);

// PUT /resources/:id/vote -> toggle vote
resourceRouter.put(
  "/:id/vote",
  authMiddleware,
  emailVerifiedMiddleware,
  resourceController.toggleVote
);

export default resourceRouter;
