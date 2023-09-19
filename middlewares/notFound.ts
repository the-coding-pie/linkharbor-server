import { NextFunction, Request, Response } from "express";
import { failure } from "../utils/responses";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  failure(res, {
    status: 404,
    message: "Invalid route",
  });
};
