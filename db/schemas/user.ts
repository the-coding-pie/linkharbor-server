import { relations } from "drizzle-orm";
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

export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 30 }).notNull(),
  username: varchar("username", { length: 20 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  password: text("password"),
  profile: text("profile").default("default.jpg").notNull(),
  isOAuth: boolean("is_oauth").default(false).notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
}));
