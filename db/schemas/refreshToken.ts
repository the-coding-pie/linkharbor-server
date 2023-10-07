import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { userTable } from "./user";

export const refreshTokenTable = pgTable("refresh_token", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => userTable.id),
  token: text("token").notNull(),
});
