import express from "express";
import * as resourceController from "../controllers/resource";
import { authMiddleware } from "../middlewares/auth";
import { emailVerifiedMiddleware } from "../middlewares/emailVerified";
import { partialAuthMiddleware } from "../middlewares/partialAuth";
import { multerUploadMultiple } from "../middlewares/multerUploadMultiple";

const resourceRouter = express.Router();

// Protected(Auth) POST /resources -> add a resource
resourceRouter.post(
  "/",
  authMiddleware,
  emailVerifiedMiddleware,
  resourceController.addResource
);

// GET /resources -> get all resources of a sub category
resourceRouter.get(
  "/:subCategoryId",
  partialAuthMiddleware,
  resourceController.getResources
);

// GET /resources/:id/voters -> get all resources of a sub category
resourceRouter.get("/:id/voters", resourceController.getUpVoters);

// PUT /resources/:id/vote -> toggle vote
resourceRouter.put(
  "/:id/vote",
  authMiddleware,
  emailVerifiedMiddleware,
  resourceController.toggleVote
);

export default resourceRouter;
