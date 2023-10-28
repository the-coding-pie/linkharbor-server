// dotenv
import "dotenv/config";

export const APP_NAME = "Link Harbor";

export const BASE_PATH = "/api/v1";
export const BASE_PATH_COMPLETE = process.env.SERVER_URL + BASE_PATH;

export const CLIENT_URL = process.env.CLIENT_URL;

// EMAIL TOKEN VALIDITY
export const EMAIL_TOKEN_VALIDITY = 1800; // 1800s = 30mins
export const EMAIL_TOKEN_LENGTH = 94;

// FORGOT PASSWORD TOKEN
export const FORGOT_PASSWORD_TOKEN_LENGTH = 124;

// resource
export const RESOURCE_TITLE_MAX_LENGTH = 40;
export const RESOURCE_DESCRIPTION_MAX_LENGTH = 60;

// paths
export const STATIC_PATH = "/static";

export const PUBLIC_DIR_NAME = "public";
export const RESOURCES_IMG_DIR_NAME = "resources";
export const CATEGORIES_IMG_DIR_NAME = "categories";
export const SUBS_IMG_DIR_NAME = "subs";
export const PROFILE_PICS_DIR_NAME = "profiles";

// resource img width and height
export const RESOURCE_SIZE = {
  WIDTH: 80,
  HEIGHT: 80,
};

// profile icon width and height
export const PROFILE_SIZE = {
  WIDTH: 250,
  HEIGHT: 250,
};

export const DEFAULT_PAGE_SIZE = 20;
