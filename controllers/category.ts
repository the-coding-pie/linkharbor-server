import { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { failure, success } from "../utils/responses";
import isNumeric from "../utils/isNumeric";
import categorizeByAlphabet from "../utils/categorizeByAlphabet";
import { getCategoryImgFullPath, getSubsImgFullPath } from "../utils/helper";

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

    const groupedByAlphabets = categorizeByAlphabet(
      categories.map((c) => ({
        ...c,
        image: getCategoryImgFullPath(c.image),
      }))
    );

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
      data: subCategories.map((sc) => ({
        ...sc,
        image: getSubsImgFullPath(sc.image),
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const getCategoriesAndSubs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await db.query.categoryTable.findMany({
      orderBy: (category, { asc }) => asc(category.name),
      columns: {
        id: true,
        name: true,
        image: true,
      },
      with: {
        subCategories: {
          orderBy: (subCategory, { asc }) => asc(subCategory.name),
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return success(res, {
      data: categories.map((c) => ({
        ...c,
        image: getCategoryImgFullPath(c.image),
        subCategories: c.subCategories.map((sc) => ({
          ...sc,
          image: getSubsImgFullPath(sc.image),
        })),
      })),
    });
  } catch (err) {
    next(err);
  }
};
