import { NextFunction, Request, Response } from "express";
import { failure, success } from "../utils/responses";
import validator from "validator";
import {
  RESOURCES_IMG_DIR_NAME,
  RESOURCE_DESCRIPTION_MAX_LENGTH,
  RESOURCE_SIZE,
  RESOURCE_TITLE_MAX_LENGTH,
} from "../config";
import { db } from "../db";
import { resourceTable } from "../db/schemas/resource";
import { saveFile } from "../utils/file";

export const getResources = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const resources = await db.query.resourceTable.findMany({
      with: {
        user: true,
        subCategory: {
          with: {
            category: true,
          },
        },
      },
      where: (resource, { eq }) => eq(resource.isDraft, false),
    });

    return success(res, {
      data: resources,
      status: 200,
    });
  } catch (err) {
    next(err);
  }
};

export const addResource = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // img, title, description, url, category, sub category
    let { url, title, description, categoryId, subCategoryId } = req.body;
    let img = req.file;

    // validations
    // url
    if (!url) {
      return failure(res, {
        message: "Url is required",
        status: 400,
      });
    } else if (!validator.isURL(url)) {
      return failure(res, {
        message: "Invalid url",
        status: 400,
      });
    }

    // title
    if (!title) {
      return failure(res, {
        message: "Title is required",
        status: 400,
      });
    } else if (title.length > RESOURCE_TITLE_MAX_LENGTH) {
      return failure(res, {
        message: "Title should be less than or equal to 40 characters long",
        status: 400,
      });
    }

    // description
    if (!description) {
      return failure(res, {
        message: "Description is required",
        status: 400,
      });
    } else if (description.length > RESOURCE_DESCRIPTION_MAX_LENGTH) {
      return failure(res, {
        message:
          "Description should be less than or equal to 60 characters long",
        status: 400,
      });
    }

    // categoryId
    if (!categoryId) {
      return failure(res, {
        message: "Category is required",
        status: 400,
      });
    }

    // subCategoryId
    if (!subCategoryId) {
      return failure(res, {
        message: "Subcategory is required",
        status: 400,
      });
    }

    // category can be either new or existing one
    // check if that category exists
    const categoryExists = await db.query.categoryTable.findFirst({
      where: (category, { eq }) => eq(category.id, categoryId),
    });

    if (!categoryExists) {
      // if not exists, then new this is new category and categoryId will be the name
      return;
    }

    // subcategory may exist or maynot exist
    // check if that subCategory is valid
    const subCategoryExists = await db.query.subCategoryTable.findFirst({
      where: (subCategory, { eq, and }) =>
        and(
          eq(subCategory.id, subCategoryId),
          eq(subCategory.categoryId, categoryExists.id)
        ),
    });

    if (!subCategoryExists) {
      // if not exists, then this is new sub category and subCategoryId will be the name
      return;
    }

    const fileName = await saveFile(
      img,
      RESOURCE_SIZE.WIDTH,
      RESOURCE_SIZE.HEIGHT,
      RESOURCES_IMG_DIR_NAME
    );

    await db.insert(resourceTable).values({
      title: validator.escape(title.trim()),
      description: validator.escape(description.trim()),
      url: url.trim(),
      subCategoryId: subCategoryExists.id,
      userId: req.user?.id,
    });

    return success(res, {
      message: "Resource added successfully",
      status: 201,
    });
  } catch (err) {
    next(err);
  }
};
