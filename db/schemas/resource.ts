import { relations } from "drizzle-orm";
import {
  boolean,
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

export const resourceTable = pgTable("resource", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: varchar("title", { length: RESOURCE_TITLE_MAX_LENGTH }).notNull(),
  description: varchar("description", {
    length: RESOURCE_DESCRIPTION_MAX_LENGTH,
  }),
  isDraft: boolean("is_draft").default(true),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id),
  subCategoryId: integer("subcategory_id")
    .notNull()
    .references(() => subCategoryTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const resourceTableRelations = relations(resourceTable, ({ one }) => ({
  user: one(userTable, {
    fields: [resourceTable.userId],
    references: [userTable.id],
  }),
  subCategory: one(subCategoryTable, {
    fields: [resourceTable.subCategoryId],
    references: [subCategoryTable.id],
  }),
}));
