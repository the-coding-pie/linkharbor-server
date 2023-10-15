import { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { failure, success } from "../utils/responses";
import isNumeric from "../utils/isNumeric";
import categorizeByAlphabet from "../utils/categorizeByAlphabet";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // return all categories alphabetically sorted
    const categories = await db.query.categoryTable.findMany({
      orderBy: (category, { asc }) => asc(category.name),
    });

    const groupedByAlphabets = categorizeByAlphabet(categories);

    return success(res, {
      data: groupedByAlphabets,
    });
  } catch (err) {
    next(err);
  }
};

// get sub categories of a category
export const getSubCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return failure(res, {
        message: "Category id is required",
        status: 400,
      });
    }

    if (!isNumeric(id)) {
      return failure(res, {
        message: "Category id should be a number",
        status: 400,
      });
    }

    // check if category is valid
    const categoryExists = await db.query.categoryTable.findFirst({
      where: (category, { eq }) => eq(category.id, parseInt(id)),
    });

    if (!categoryExists) {
      return failure(res, {
        message: "Category not found",
        status: 404,
      });
    }

    // return all subCategories of this category alphabetically sorted
    const subCategories = await db.query.subCategoryTable.findMany({
      where: (subCategory, { eq }) =>
        eq(subCategory.categoryId, categoryExists.id),
      orderBy: (subCategory, { asc }) => asc(subCategory.name),
    });

    return success(res, {
      data: subCategories,
    });
  } catch (err) {
    next(err);
  }
};
