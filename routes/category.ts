import express from "express";
import * as categoryController from "../controllers/category";
import { adminAuthMiddleware } from "../middlewares/adminAuth";
import { multerUploadSingle } from "../middlewares/multerUploadSingle";

const categoryRouter = express.Router();

// GET /categories -> get all categories
categoryRouter.get(`/`, categoryController.getCategories);
categoryRouter.get(`/:id`, categoryController.getSubCategories);
categoryRouter.get(`/subs/all`, categoryController.getCategoriesAndSubs);

// add category POST /categories
categoryRouter.post(
  `/`,
  adminAuthMiddleware,
  function (req, res, next) {
    multerUploadSingle(req, res, next, "category_img");
  },
  categoryController.addCategory
);
// add sub category POST /categories/subs
categoryRouter.post(
  `/subs`,
  adminAuthMiddleware,
  function (req, res, next) {
    multerUploadSingle(req, res, next, "subs_img");
  },
  categoryController.addSubCategory
);

// update category PUT /categories/:id
categoryRouter.put(
  "/:id",
  adminAuthMiddleware,
  function (req, res, next) {
    multerUploadSingle(req, res, next, "category_img");
  },
  categoryController.updateCategory
);

// update category PUT /categories/subs/:id
categoryRouter.put(
  "/subs/:id",
  adminAuthMiddleware,
  function (req, res, next) {
    multerUploadSingle(req, res, next, "subs_img");
  },
  categoryController.updateSubCategory
);

export default categoryRouter;
