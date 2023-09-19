import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

// dotenv
import "dotenv/config";

const migrationClient = postgres({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT!),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  max: 1,
});

// for migration
const db = drizzle(migrationClient);

const main = async () => {
  try {
    console.log("Starting migration 🏁...");

    await migrate(db, { migrationsFolder: "migrations" });

    console.log("Starting finished ✅...");
  } catch (err) {
    console.log("Migration failed ❌");
  } finally {
    process.exit(0);
  }
};

main();
