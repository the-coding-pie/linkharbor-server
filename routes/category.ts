import express from "express";
import * as categoryController from "../controllers/category";

const categoryRouter = express.Router();

// GET /categories -> get all categories
categoryRouter.get(`/`, categoryController.getCategories);
categoryRouter.get(`/:id`, categoryController.getSubCategories);

export default categoryRouter;
