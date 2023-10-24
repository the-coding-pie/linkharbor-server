import { NextFunction, Request, Response } from "express";
import { failure, success } from "../utils/responses";
import validator from "validator";
import {
  RESOURCE_DESCRIPTION_MAX_LENGTH,
  RESOURCE_TITLE_MAX_LENGTH,
} from "../config";
import { db } from "../db";
import { categoryTable } from "../db/schemas/category";
import { subCategoryTable } from "../db/schemas/subCategory";
import { resourceTable } from "../db/schemas/resource";
import { tempResourceTable } from "../db/schemas/tempResource";
import { eq, sql } from "drizzle-orm";
import isNumeric from "../utils/isNumeric";
import { voteTable } from "../db/schemas/vote";
import { userTable } from "../db/schemas/user";

// get all resources for a sub category
export const getResources = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { subCategoryId } = req.params;

  if (!subCategoryId) {
    return failure(res, {
      message: "subCategoryId is required",
      status: 400,
    });
  }

  if (!isNumeric(subCategoryId)) {
    return failure(res, {
      message: "subCategoryId should be a number",
      status: 400,
    });
  }

  // check if sub category exists
  const subCategoryExists = await db.query.subCategoryTable.findFirst({
    where: (subCategory, { eq }) => eq(subCategory.id, parseInt(subCategoryId)),
  });

  if (!subCategoryExists) {
    return failure(res, {
      message: "Sub Category not found",
      status: 404,
    });
  }

  try {
    const resources = await db
      .select({
        id: resourceTable.id,
        url: resourceTable.url,
        title: resourceTable.title,
        description: resourceTable.description,
        createdAt: resourceTable.createdAt,
        updatedAt: resourceTable.updatedAt,
        user: {
          name: userTable.name,
          username: userTable.username,
          profile: userTable.profile,
          joinedOn: userTable.createdAt,
        },
        subCategory: {
          id: subCategoryTable.id,
          name: subCategoryTable.name,
        },
        category: {
          id: categoryTable.id,
          name: categoryTable.name,
        },
        voteCount: sql<number>`count(${voteTable.id})`.mapWith(Number),
      })
      .from(resourceTable)
      .where(eq(resourceTable.subCategoryId, subCategoryExists.id))
      .leftJoin(userTable, eq(userTable.id, resourceTable.userId))
      .leftJoin(
        subCategoryTable,
        eq(subCategoryTable.id, resourceTable.subCategoryId)
      )
      .leftJoin(
        categoryTable,
        eq(categoryTable.id, subCategoryTable.categoryId)
      )
      .leftJoin(voteTable, eq(voteTable.resourceId, resourceTable.id))
      .groupBy(
        sql`${resourceTable.id}, ${userTable.name}, ${userTable.username}, ${userTable.profile}, ${userTable.createdAt}, ${subCategoryTable.id}, ${categoryTable.id}`
      )
      .orderBy(sql`count(${voteTable.id}) DESC`); // Sort by vote count in descending order

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
    // title, description, url, category, sub category
    let { url, title, description, categoryId, subCategoryId } = req.body;

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
    categoryId = isNumeric(categoryId)
      ? categoryId
      : validator.escape(categoryId.trim());
    subCategoryId = isNumeric(subCategoryId)
      ? subCategoryId
      : validator.escape(subCategoryId.trim());

    // if the submitting person is an admin
    if (req.user.isAdmin) {
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

      return success(res, {
        message: "Resource added successfully",
        status: 201,
      });
    }

    // if normal user
    // check if it is already present in resource table

    // check if category exists or a new one
    const categoryExists = await db.query.categoryTable.findFirst({
      where: (category, { or, eq }) =>
        or(
          isNumeric(categoryId) ? eq(category.id, categoryId) : undefined,
          sql`lower(${category.name}) = lower(${categoryId})`
        ),
    });

    if (categoryExists) {
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

      if (subCategoryExists) {
        // check if resource is unique in this sub category
        const resourceExists = await db.query.resourceTable.findFirst({
          where: (resource, { eq, and, or }) =>
            or(
              and(
                eq(resource.subCategoryId, subCategoryExists.id),
                sql`lower(${resource.title}) = lower(${title})`
              ),
              and(
                eq(resource.subCategoryId, subCategoryExists.id),
                eq(resource.url, url)
              )
            ),
        });

        if (resourceExists) {
          return failure(res, {
            status: 409,
            message:
              "A resource with this same title or url already exists in this sub category",
          });
        }
      }
    }

    // this resource doesn't exist in resourceTable
    // now check in tempResourceTable if entry is unique or not (to prevent duplicate entries)
    const tempResourceExists = await db.query.tempResourceTable.findFirst({
      where: (tempResource, { eq, and, or }) =>
        or(
          and(
            sql`lower(${tempResource.category}) = lower(${categoryId})`,
            sql`lower(${tempResource.subCategory}) = lower(${subCategoryId})`,
            sql`lower(${tempResource.title}) = lower(${title})`
          ),
          and(
            sql`lower(${tempResource.category}) = lower(${categoryId})`,
            sql`lower(${tempResource.subCategory}) = lower(${subCategoryId})`,
            eq(tempResource.url, url)
          )
        ),
    });

    if (tempResourceExists) {
      return failure(res, {
        message:
          "A resource with this same information has already been added and is awaiting for approval",
        status: 409,
      });
    }

    // completely new entry
    // add the data to the tempResource
    await db.insert(tempResourceTable).values({
      url,
      title,
      description,
      userId: req.user.id,
      category: categoryId,
      subCategory: subCategoryId,
    });

    return success(res, {
      message: "Your submission is in, awaiting our thumbs up 👍!",
      status: 201,
    });
  } catch (err) {
    next(err);
  }
};
// toggle vote for the resource
export const toggleVote = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return failure(res, {
        message: "category id is required",
        status: 400,
      });
    }

    if (!isNumeric(id)) {
      return failure(res, {
        message: "category id should be a number",
        status: 400,
      });
    }

    // check if it is a valid resource
    const resourceExists = await db.query.resourceTable.findFirst({
      where: (resource, { eq }) => eq(resource.id, parseInt(id)),
    });

    if (!resourceExists) {
      return failure(res, {
        message: "Resource with this id not found",
        status: 404,
      });
    }

    // if user already upvoted it, then downvote it, or else upvote it
    const voteExists = await db.query.voteTable.findFirst({
      where: (vote, { eq, and }) =>
        and(
          eq(vote.userId, req.user.id),
          eq(vote.resourceId, resourceExists.id)
        ),
    });

    if (voteExists) {
      // remove it
      await db.delete(voteTable).where(eq(voteTable.id, voteExists.id));
    } else {
      // add it
      await db.insert(voteTable).values({
        userId: req.user.id,
        resourceId: resourceExists.id,
      });
    }

    return success(res, {
      status: 200,
      message: "Vote updated successfully",
    });
  } catch (err) {
    next(err);
  }
};
