import { NextFunction } from "express";
import { failure } from "../utils/responses";
import jwt from "jsonwebtoken";
import { UserTokenObj } from "../types/interfaces";
import { db } from "../db";
import { userTable } from "../db/schemas/user";
import { eq } from "drizzle-orm";

export const adminAuthMiddleware = async (
  req: any,
  res: any,
  next: NextFunction
) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token) {
    return failure(res, { status: 401, message: "Invalid token" });
  }

  // in token -> { id: 123 }
  // jwt verify() will throw an error
  try {
    const payload = (await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    )) as UserTokenObj;

    // check in db
    const user = await db
      .select({
        id: userTable.id,
        username: userTable.username,
        profile: userTable.profile,
        email: userTable.email,
        isAdmin: userTable.isAdmin,
        emailVerified: userTable.emailVerified,
        isOAuth: userTable.isOAuth,
      })
      .from(userTable)
      .where(eq(userTable.id, payload.id));

    // if no such user exists (bcz user has been deleted or invalid user id)
    if (!user.length) {
      return failure(res, {
        status: 401,
        message: "Invalid user",
      });
    }

    // if the user is not an admin
    if (!user[0].isAdmin) {
      return failure(res, {
        status: 403,
        message: "Forbidden",
      });
    }

    req.user = user[0];
    next();
  } catch (err) {
    return failure(res, {
      status: 401,
      message: "Invalid access token",
    });
  }
};
