import express from "express";
import * as resourceController from "../controllers/resource";
import { authMiddleware } from "../middlewares/auth";

const resourceRouter = express.Router();

// Protected(Auth) POST /resources -> add a resource
resourceRouter.post("/", authMiddleware, resourceController.addResource);

// GET /resources -> get all resources
resourceRouter.get("/", resourceController.getResources);

export default resourceRouter;
