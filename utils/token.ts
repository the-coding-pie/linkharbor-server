import jwt from "jsonwebtoken";
import { UserTokenObj } from "../types/interfaces";
import { db } from "../db";
import { refreshTokenTable } from "../db/schemas/refreshToken";
import { eq } from "drizzle-orm";

// 5 mins
export const generateAccessToken = (payload: UserTokenObj) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "5m",
  });
};

// 7 days
export const generateRefreshToken = async (payload: UserTokenObj) => {
  // check if a valid refresh token exists in database, if so return that, else new one
  const tokenExists = await db
    .select()
    .from(refreshTokenTable)
    .limit(1)
    .where(eq(refreshTokenTable.userId, payload.id));

  if (tokenExists.length > 0) {
    try {
      await jwt.verify(tokenExists[0].token, process.env.REFRESH_TOKEN_SECRET!);

      return tokenExists[0].token;
    } catch (e) {
      // delete old token
      await db
        .delete(refreshTokenTable)
        .where(eq(refreshTokenTable.id, tokenExists[0].id));

      // generate new one
      const newToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: "7d",
      });

      await db.insert(refreshTokenTable).values({
        userId: payload.id,
        token: newToken,
      });

      return newToken;
    }
  } else {
    const newToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: "7d",
    });

    await db.insert(refreshTokenTable).values({
      userId: payload.id,
      token: newToken,
    });

    return newToken;
  }
};
