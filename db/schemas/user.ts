import { relations, sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { resourceTable } from "./resource";
import { emailVerificationTable } from "./emailVerification";
import { forgotPasswordTable } from "./forgotPassword";
import { refreshTokenTable } from "./refreshToken";
import { voteTable } from "./vote";
import { DEFAULT_PROFILE_IMG_NAME } from "../../config";

export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 30 }).notNull(),
  username: varchar("username", { length: 30 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  password: text("password"),
  profile: text("profile").default(DEFAULT_PROFILE_IMG_NAME).notNull(),
  isOAuth: boolean("is_oauth").default(false).notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  usernameUpdated: boolean("username_updated").default(false),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const userTableRelations = relations(userTable, ({ many, one }) => ({
  resources: many(resourceTable),
  emailVerification: one(emailVerificationTable, {
    fields: [userTable.id],
    references: [emailVerificationTable.userId],
  }),
  forgotPassword: one(forgotPasswordTable, {
    fields: [userTable.id],
    references: [forgotPasswordTable.userId],
  }),
  refreshToken: one(refreshTokenTable, {
    fields: [userTable.id],
    references: [refreshTokenTable.userId],
  }),
  votes: many(voteTable),
}));
