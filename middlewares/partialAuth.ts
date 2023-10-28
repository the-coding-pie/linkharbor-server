import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserTokenObj } from "../types/interfaces";
import { db } from "../db";
import { userTable } from "../db/schemas/user";
import { eq } from "drizzle-orm";
import { failure } from "../utils/responses";

export const partialAuthMiddleware = async (
  req: any,
  res: any,
  next: NextFunction
) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  // if token, then check and throw 401 if invalid token
  // else simply return response
  if (token) {
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
          name: userTable.name,
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

      req.user = user[0];
    } catch (err) {
      return failure(res, {
        status: 401,
        message: "Invalid access token",
      });
    }
  }

  next();
};
