import { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { failure, success } from "../utils/responses";
import isNumeric from "../utils/isNumeric";
import validator from "validator";
import {
  RESOURCE_DESCRIPTION_MAX_LENGTH,
  RESOURCE_TITLE_MAX_LENGTH,
} from "../config";
import { eq, sql } from "drizzle-orm";
import { categoryTable } from "../db/schemas/category";
import { subCategoryTable } from "../db/schemas/subCategory";
import { resourceTable } from "../db/schemas/resource";
import { tempResourceTable } from "../db/schemas/tempResource";

// get all tempResource
export const getTempResources = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tempResources = await db.query.tempResourceTable.findMany({
      orderBy: (tempResource, { desc }) => [desc(tempResource.createdAt)],
    });

    return success(res, {
      data: tempResources,
      status: 200,
    });
  } catch (err) {
    next(err);
  }
};

// approve resource from tempResourceTable
export const approveTempResource = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    // title, description, url, category, sub category
    let { url, title, description, categoryId, subCategoryId } = req.body;

    if (!id) {
      return failure(res, {
        message: "id is required",
        status: 400,
      });
    }

    if (!isNumeric(id)) {
      return failure(res, {
        message: "id should be a number",
        status: 400,
      });
    }

    // find if it is a valid tempResource
    const tempResourceExists = await db.query.tempResourceTable.findFirst({
      where: (tempResource, { eq }) => eq(tempResource.id, parseInt(id)),
    });

    if (!tempResourceExists) {
      return failure(res, {
        message: "TempResource not found",
        status: 404,
      });
    }

    // other validations
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
        message: "categoryId is required",
        status: 400,
      });
    }

    // subCategoryId
    if (!subCategoryId) {
      return failure(res, {
        message: "subCategoryId is required",
        status: 400,
      });
    }

    // trim and escape values
    url = url.trim();
    title = validator.escape(title.trim());
    description = validator.escape(description.trim());
    categoryId = validator.escape(categoryId.trim());
    subCategoryId = validator.escape(subCategoryId.trim());

    // convert that tempResource into resource
    let isSubCategoryNew = false;

    // check if category exists or a new one
    const categoryExists = await db.query.categoryTable.findFirst({
      where: (category, { or, eq }) =>
        or(
          isNumeric(categoryId) ? eq(category.id, categoryId) : undefined,
          sql`lower(${category.name}) = lower(${categoryId})`
        ),
    });

    if (!categoryExists) {
      // categoryId would be the name instead of id
      // create the category and subCategory
      const newCategory = await db
        .insert(categoryTable)
        .values({
          name: categoryId,
        })
        .returning();

      // create new sub category
      const newSubCategory = await db
        .insert(subCategoryTable)
        .values({
          name: subCategoryId,
          categoryId: newCategory[0].id,
        })
        .returning();

      categoryId = newCategory[0].id;
      subCategoryId = newSubCategory[0].id;

      isSubCategoryNew = true;
    } else {
      // category exists
      // check if this subCategory exists or a whether it is a new one in that category
      const subCategoryExists = await db.query.subCategoryTable.findFirst({
        where: (subCategory, { and, or, eq }) =>
          and(
            or(
              isNumeric(subCategoryId)
                ? eq(subCategory.id, subCategoryId)
                : undefined,
              sql`lower(${subCategory.name}) = lower(${subCategoryId})`
            ),
            eq(subCategory.categoryId, categoryExists.id)
          ),
      });

      if (!subCategoryExists) {
        // create new sub category
        const newSubCategory = await db
          .insert(subCategoryTable)
          .values({
            name: subCategoryId,
            categoryId: categoryExists.id,
          })
          .returning();

        subCategoryId = newSubCategory[0].id;

        isSubCategoryNew = true;
      }
    }

    // if it is not a new sub category
    if (!isSubCategoryNew) {
      // check if resource is unique in this sub category
      const resourceExists = await db.query.resourceTable.findFirst({
        where: (resource, { eq, and, or }) =>
          or(
            and(
              isNumeric(subCategoryId)
                ? eq(resource.subCategoryId, subCategoryId)
                : undefined,
              sql`lower(${resource.title}) = lower(${title})`
            ),
            and(
              isNumeric(subCategoryId)
                ? eq(resource.subCategoryId, subCategoryId)
                : undefined,
              eq(resource.url, url)
            )
          ),
      });

      if (resourceExists) {
        return failure(res, {
          message:
            "A resource with this same title or url already exists in this sub category",
          status: 409,
        });
      }
    }

    // add resource
    await db.insert(resourceTable).values({
      url,
      title,
      userId: req.user.id,
      description,
      subCategoryId,
    });

    // remove tempResource
    await db
      .delete(tempResourceTable)
      .where(eq(tempResourceTable.id, tempResourceExists.id));

    return success(res, {
      message: "Resource added successfully",
      status: 201,
    });
  } catch (err) {
    next(err);
  }
};

// delete tempResource
export const removeTempResource = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return failure(res, {
        message: "id is required",
        status: 400,
      });
    }

    if (!isNumeric(id)) {
      return failure(res, {
        message: "id should be a number",
        status: 400,
      });
    }

    // find if it is a valid tempResource
    const tempResourceExists = await db.query.tempResourceTable.findFirst({
      where: (tempResource, { eq }) => eq(tempResource.id, parseInt(id)),
    });

    if (!tempResourceExists) {
      return failure(res, {
        message: "TempResource not found",
        status: 404,
      });
    }

    // now delete the tempResource
    await db
      .delete(tempResourceTable)
      .where(eq(tempResourceTable.id, tempResourceExists.id));

    return success(res, {
      message: "Temp Resource removed successfully",
      status: 201,
    });
  } catch (err) {
    next(err);
  }
};
