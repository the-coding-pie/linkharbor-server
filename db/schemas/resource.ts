import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { subCategoryTable } from "./subCategory";
import {
  RESOURCE_DESCRIPTION_MAX_LENGTH,
  RESOURCE_TITLE_MAX_LENGTH,
} from "../../config";
import { voteTable } from "./vote";

export const resourceTable = pgTable("resource", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: varchar("title", { length: RESOURCE_TITLE_MAX_LENGTH }).notNull(),
  description: varchar("description", {
    length: RESOURCE_DESCRIPTION_MAX_LENGTH,
  }).notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id),
  subCategoryId: integer("subcategory_id")
    .notNull()
    .references(() => subCategoryTable.id),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const resourceTableRelations = relations(
  resourceTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [resourceTable.userId],
      references: [userTable.id],
    }),
    subCategory: one(subCategoryTable, {
      fields: [resourceTable.subCategoryId],
      references: [subCategoryTable.id],
    }),
    votes: many(voteTable),
  })
);
