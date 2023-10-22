import { NextFunction, Response } from "express";
import { success } from "../utils/responses";

export const getCurrentUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    return success(res, {
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        isAdmin: user.isAdmin,
        isOAuth: user.isOAuth,
        email: user.email,
        emailVerified: user.emailVerified,
        profile: user.profile,
      },
      message: "",
    });
  } catch {
    next();
  }
};
