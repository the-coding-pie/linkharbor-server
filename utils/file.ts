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
  const fileName = prefixName
    ? prefixName +
      "_" +
      new Date().toISOString() +
      createRandomToken(24) +
      ".jpeg"
    : new Date().toISOString() + createRandomToken(24) + ".jpeg";

  await sharp(file.buffer)
    .resize(width, height)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(PUBLIC_DIR_NAME, directory, fileName));

  return fileName;
};

export const removeFile = async (path: string) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("successfully deleted file");
    }
  });
};
