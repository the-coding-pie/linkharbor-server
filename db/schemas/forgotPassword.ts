import {
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { FORGOT_PASSWORD_TOKEN_LENGTH } from "../../config";
import { add } from "date-fns";
import { userTable } from "./user";

export const forgotPasswordTable = pgTable("forgot_password", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => userTable.id),
  token: varchar("token", { length: FORGOT_PASSWORD_TOKEN_LENGTH }).notNull(),
  expiresAt: timestamp("expires_at").default(
    add(new Date(), {
      days: 3,
    })
  ),
});
