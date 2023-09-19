import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const refreshTokenTable = pgTable("refresh_token", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  token: text("token").notNull(),
});
