import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { failure } from "../utils/responses";

export const errorHandler = (
  err: ErrorRequestHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);
  failure(res, {
    status: 500,
    message: "Something went wrong",
  });
};
