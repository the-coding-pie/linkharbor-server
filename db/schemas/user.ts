import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 30 }).notNull(),
  username: varchar("username", { length: 20 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  password: text("password"),
  profile: text("profile").default("default.jpg").notNull(),
  isOAuth: boolean("is_oauth").default(false).notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
