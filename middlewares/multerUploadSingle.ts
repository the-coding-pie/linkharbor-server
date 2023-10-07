import { NextFunction, Response } from "express";
import multer from "multer";
import upload from "../utils/multerConfig";
import { failure } from "../utils/responses";

export const multerUploadSingle = async (
  req: any,
  res: Response,
  next: NextFunction,
  fileName: string
) => {
  // const upload = multer().single()
  // upload(req, res, (err) => {})
  // for us, upload = multer, so upload above becames file
  const file = upload.single(fileName);

  file(req, res, (err: any) => {
    // file size error
    if (err instanceof multer.MulterError) {
      return failure(res, {
        status: 400,
        message: err.message,
      });
    } else if (err) {
      // invalid file type
      return failure(res, {
        status: 400,
        message: "Unsupported image type",
      });
    }
    next();
  });
};
