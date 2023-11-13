import sharp from "sharp";
import path from "path";
import { PUBLIC_DIR_NAME } from "../config";
import fs from "fs";
import createRandomToken from "./createRandomToken";

// save file
export const saveFile = async (
  file: any,
  width: number,
  height: number,
  directory: string,
  prefixName?: string
) => {
  const type = file?.mimetype?.split("/");

  const randomToken = await createRandomToken(24);
  const fileName = prefixName
    ? prefixName +
      "_" +
      new Date().toISOString() +
      randomToken +
      "." +
      type[type.length - 1]
    : new Date().toISOString() + randomToken + "." + type[type.length - 1];

  await sharp(file.buffer)
    .resize(width, height)
    .toFile(path.join(PUBLIC_DIR_NAME, directory, fileName));

  return fileName;
};

export const removeFile = async (path: string) => {
  return fs.unlink(path, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("successfully deleted file");
    }
  });
};
