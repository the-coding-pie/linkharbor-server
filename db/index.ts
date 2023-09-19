import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

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

// for querying
export const db: PostgresJsDatabase = drizzle(queryClient);
