import { NextFunction, Request, Response } from "express";
import { failure } from "../utils/responses";

export const emailVerifiedMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  // if the user has not verified email
  if (!req?.user?.emailVerified) {
    return failure(res, {
      status: 401,
      message: "Please verify your email before continue",
    });
  } else {
    next();
  }
};
