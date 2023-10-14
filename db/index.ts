import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as userSchema from "./schemas/user";
import * as emailVerificationSchema from "./schemas/emailVerification";
import * as forgotPasswordSchema from "./schemas/forgotPassword";
import * as refreshTokenSchema from "./schemas/refreshToken";
import * as resourceSchema from "./schemas/resource";
import * as categorySchema from "./schemas/category";
import * as subCategorySchema from "./schemas/subCategory";
import * as tempResourceSchema from "./schemas/tempResource";

// dotenv
import "dotenv/config";

const queryClient = postgres({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT!),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  max: 10, // this is the default value though,
});

// for better query syntax
export const db = drizzle(queryClient, {
  schema: {
    ...userSchema,
    ...emailVerificationSchema,
    ...forgotPasswordSchema,
    ...refreshTokenSchema,
    ...resourceSchema,
    ...categorySchema,
    ...subCategorySchema,
    ...tempResourceSchema,
  },
});
