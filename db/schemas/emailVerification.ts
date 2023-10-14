import {
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { EMAIL_TOKEN_LENGTH } from "../../config";
import { add } from "date-fns";
import { userTable } from "./user";
import getCurrentUTCDate from "../../utils/getCurrentUTCDate";

export const emailVerificationTable = pgTable("email_verification", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => userTable.id),
  token: varchar("token", { length: EMAIL_TOKEN_LENGTH }).notNull(),
  expiresAt: timestamp("expires_at").default(
    add(getCurrentUTCDate(), {
      minutes: 30,
    })
  ),
});
