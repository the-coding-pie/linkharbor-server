import { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { failure, success } from "../utils/responses";
import isNumeric from "../utils/isNumeric";
import categorizeByAlphabet from "../utils/categorizeByAlphabet";
import { getCategoryImgFullPath, getSubsImgFullPath } from "../utils/helper";
import {
  CATEGORIES_IMG_DIR_NAME,
  CATEGORY_MAX_LENGTH,
  CATEGORY_SIZE,
  DEFAULT_CATEGORY_IMG_NAME,
  DEFAULT_SUB_CATEGORY_IMG_NAME,
  PUBLIC_DIR_NAME,
  SUBS_IMG_DIR_NAME,
  SUB_CATEGORY_SIZE,
} from "../config";
import { and, eq, sql } from "drizzle-orm";
import validator from "validator";
import { removeFile, saveFile } from "../utils/file";
import { categoryTable } from "../db/schemas/category";
import { subCategoryTable } from "../db/schemas/subCategory";
import path from "path";
import getCurrentUTCDate from "../utils/getCurrentUTCDate";

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
    } else if (!isNumeric(id)) {
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

// add category (for admin only)
export const addCategory = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let { name } = req.body;
    const category_img = req.file;

    let fileName = DEFAULT_CATEGORY_IMG_NAME;

    if (!name) {
      return failure(res, {
        status: 400,
        message: "Category name is required",
      });
    } else if (typeof name !== "string") {
      return failure(res, {
        status: 400,
        message: "Category name should be string",
      });
    } else if (name.length > CATEGORY_MAX_LENGTH) {
      return failure(res, {
        status: 400,
        message: "Category name should be <= 200 chars long",
      });
    }

    name = validator.escape(name.trim());

    // check if category with same name exists or not
    // check if category exists or a new one
    const categoryExists = await db.query.categoryTable.findFirst({
      where: (category) => sql`lower(${category.name}) = lower(${name})`,
    });

    if (categoryExists) {
      return failure(res, {
        status: 400,
        message: "Category with same name already exists",
      });
    }

    // check if img is there, if yes save it
    if (category_img) {
      fileName = await saveFile(
        category_img,
        CATEGORY_SIZE.WIDTH,
        CATEGORY_SIZE.HEIGHT,
        CATEGORIES_IMG_DIR_NAME,
        name
      );
    }

    // create category
    await db.insert(categoryTable).values({
      name,
      image: fileName,
    });

    return success(res, {
      status: 201,
      message: "New category has been added successfully 🚀!",
    });
  } catch (err) {
    next(err);
  }
};

// add sub category (for admin only)
export const addSubCategory = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let { categoryId, name } = req.body;
    const subs_img = req.file;

    let fileName = DEFAULT_SUB_CATEGORY_IMG_NAME;

    if (!categoryId) {
      return failure(res, {
        status: 400,
        message: "Parent category Id is required",
      });
    }

    if (!name) {
      return failure(res, {
        status: 400,
        message: "Sub category name is required",
      });
    } else if (typeof name !== "string") {
      return failure(res, {
        status: 400,
        message: "Sub category name should be string",
      });
    } else if (name.length > CATEGORY_MAX_LENGTH) {
      return failure(res, {
        status: 400,
        message: "Sub category name should be <= 200 chars long",
      });
    }

    // categoryId can both be a number and a string,
    // because admin can create categoryId on the fly
    categoryId =
      typeof categoryId === "number"
        ? categoryId
        : validator.escape(categoryId.trim());
    name = validator.escape(name.trim());

    // check if category exists or not
    const categoryExists = await db.query.categoryTable.findFirst({
      where: (category, { eq }) =>
        typeof categoryId === "number"
          ? eq(category.id, categoryId)
          : sql`lower(${category.name}) = lower(${categoryId})`,
    });

    if (categoryExists) {
      categoryId = categoryExists.id;
    } else {
      if (typeof categoryId !== "string") {
        return failure(res, {
          status: 400,
          message:
            "Category with that id doesn't exists. If it is a new category name, please pass it as a string",
        });
      }

      const newCategory = await db
        .insert(categoryTable)
        .values({
          name: categoryId,
        })
        .returning();

      categoryId = newCategory[0].id;
    }

    // check if img is there, if yes save it
    if (subs_img) {
      fileName = await saveFile(
        subs_img,
        SUB_CATEGORY_SIZE.WIDTH,
        SUB_CATEGORY_SIZE.HEIGHT,
        SUBS_IMG_DIR_NAME,
        name
      );
    }

    // create sub category
    await db.insert(subCategoryTable).values({
      name,
      image: fileName,
      categoryId,
    });

    return success(res, {
      status: 201,
      message: "New sub category has been added successfully 🚀!",
    });
  } catch (err) {
    next(err);
  }
};

// category update
export const updateCategory = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    let { name } = req.body;
    const category_img = req.file;

    let values: any = {};

    let fileName;

    if (!id) {
      return failure(res, {
        message: "Category id is required",
        status: 400,
      });
    } else if (!isNumeric(id)) {
      return failure(res, {
        message: "Category id should be a number",
        status: 400,
      });
    }

    if (Object.keys(req.body).includes("name")) {
      if (!name) {
        return failure(res, {
          status: 400,
          message: "Category name is required",
        });
      } else if (typeof name !== "string") {
        return failure(res, {
          status: 400,
          message: "Category name should be string",
        });
      } else if (name.length > CATEGORY_MAX_LENGTH) {
        return failure(res, {
          status: 400,
          message: "Category name should be <= 200 chars long",
        });
      }

      values.name = validator.escape(name.trim());
    }

    // check if category is valid
    const categoryExists = await db.query.categoryTable.findFirst({
      where: (category, { eq }) => eq(category.id, parseInt(id)),
    });

    if (!categoryExists) {
      return failure(res, {
        status: 404,
        message: "Category not found",
      });
    }

    if (category_img) {
      // remove old image and upload new image
      if (categoryExists.image !== DEFAULT_CATEGORY_IMG_NAME) {
        await removeFile(
          path.join(
            PUBLIC_DIR_NAME,
            CATEGORIES_IMG_DIR_NAME,
            categoryExists.image
          )
        );
      }

      fileName = await saveFile(
        category_img,
        CATEGORY_SIZE.WIDTH,
        CATEGORY_SIZE.HEIGHT,
        CATEGORIES_IMG_DIR_NAME,
        categoryExists.name
      );
    } else {
      fileName = categoryExists.image;
    }

    // update category
    await db
      .update(categoryTable)
      .set({
        ...values,
        image: fileName,
        updatedAt: getCurrentUTCDate(),
      })
      .where(eq(categoryTable.id, categoryExists.id));

    return success(res, {
      message: "Category updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

// sub category update
export const updateSubCategory = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    let { name, categoryId } = req.body;
    const subs_img = req.file;

    let values: any = {};

    let fileName;

    if (!id) {
      return failure(res, {
        message: "Sub Category id is required",
        status: 400,
      });
    } else if (!isNumeric(id)) {
      return failure(res, {
        message: "Sub Category id should be a number",
        status: 400,
      });
    }

    if (Object.keys(req.body).includes("name")) {
      if (!name) {
        return failure(res, {
          status: 400,
          message: "Sub category name is required",
        });
      } else if (typeof name !== "string") {
        return failure(res, {
          status: 400,
          message: "Sub category name should be string",
        });
      } else if (name.length > CATEGORY_MAX_LENGTH) {
        return failure(res, {
          status: 400,
          message: "Sub category name should be <= 200 chars long",
        });
      }

      values.name = validator.escape(name.trim());
    }

    // check if sub category is valid
    const subCategoryExists = await db.query.subCategoryTable.findFirst({
      where: (subCategory, { eq }) => eq(subCategory.id, parseInt(id)),
    });

    if (!subCategoryExists) {
      return failure(res, {
        status: 404,
        message: "Sub category not found",
      });
    }

    // sub category exists
    // check if they are trying to change categoryId, if yes, do it's validation
    if (categoryId && categoryId !== subCategoryExists.categoryId) {
      if (!isNumeric(categoryId)) {
        return failure(res, {
          message: "Category id should be a number",
          status: 400,
        });
      }

      // check if that category exists
      const categoryExists = await db.query.categoryTable.findFirst({
        where: (category, { eq }) => eq(category.id, parseInt(categoryId)),
      });

      if (!categoryExists) {
        return failure(res, {
          status: 404,
          message: "Category not found",
        });
      }

      // check if that category doesn't contain sub category with this same name
      const subCatWithSameNameExists = await db
        .select()
        .from(subCategoryTable)
        .where(
          and(
            eq(subCategoryTable.categoryId, categoryExists.id),
            eq(subCategoryTable.name, subCategoryExists.name)
          )
        );

      if (subCatWithSameNameExists.length) {
        // sub category with same name exists in that category
        // don't allow the operation
        return failure(res, {
          status: 409,
          message: "Sub category with same name exists in the category",
        });
      }

      values.categoryId = categoryId;
    }

    if (subs_img) {
      // remove old image and upload new image
      if (subCategoryExists.image !== DEFAULT_SUB_CATEGORY_IMG_NAME) {
        await removeFile(
          path.join(PUBLIC_DIR_NAME, SUBS_IMG_DIR_NAME, subCategoryExists.image)
        );
      }

      fileName = await saveFile(
        subs_img,
        SUB_CATEGORY_SIZE.WIDTH,
        SUB_CATEGORY_SIZE.HEIGHT,
        SUBS_IMG_DIR_NAME,
        subCategoryExists.name
      );
    } else {
      fileName = subCategoryExists.image;
    }

    // update sub category
    await db
      .update(subCategoryTable)
      .set({
        ...values,
        image: fileName,
        updatedAt: getCurrentUTCDate(),
      })
      .where(eq(subCategoryTable.id, subCategoryExists.id));

    return success(res, {
      message: "Sub category updated successfully",
    });
  } catch (err) {
    next(err);
  }
};
