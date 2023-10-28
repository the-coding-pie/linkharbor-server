import path from "path";
import {
  BASE_PATH_COMPLETE,
  CATEGORIES_IMG_DIR_NAME,
  PROFILE_PICS_DIR_NAME,
  STATIC_PATH,
  SUBS_IMG_DIR_NAME,
} from "../config";

// creates 'n' length char long hex string
export const createRandomToken = (length: number) => {
  return import("nanoid").then(({ nanoid }) => nanoid(length));
};

// get profile pic path
export const getProfile = (profile: string) => {
  return profile.includes("http")
    ? profile
    : BASE_PATH_COMPLETE +
        path.join(STATIC_PATH, PROFILE_PICS_DIR_NAME, profile);
};

// get category pic path
export const getCategoryImgFullPath = (name: string) => {
  return name.includes("http")
    ? name
    : BASE_PATH_COMPLETE +
        path.join(STATIC_PATH, CATEGORIES_IMG_DIR_NAME, name);
};

// get sub category pic path
export const getSubsImgFullPath = (name: string) => {
  return name.includes("http")
    ? name
    : BASE_PATH_COMPLETE + path.join(STATIC_PATH, SUBS_IMG_DIR_NAME, name);
};
