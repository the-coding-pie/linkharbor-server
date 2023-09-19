// config for migration - drizzle-kit
// we are using this file just for migration purpose (no drizzle-kit push or drizzle-kit pull)

import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schemas/*",
  out: "./migrations",
} satisfies Config;
