import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { categoryTable } from "./category";
import { resourceTable } from "./resource";
import {
  DEFAULT_SUB_CATEGORY_IMG_NAME,
  SUB_CATEGORY_MAX_LENGTH,
} from "../../config";

export const subCategoryTable = pgTable("sub_category", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: SUB_CATEGORY_MAX_LENGTH }).notNull(),
  image: varchar("image").default(DEFAULT_SUB_CATEGORY_IMG_NAME).notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoryTable.id),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const subCategoryTableRelations = relations(
  subCategoryTable,
  ({ one, many }) => ({
    category: one(categoryTable, {
      fields: [subCategoryTable.categoryId],
      references: [categoryTable.id],
    }),
    resources: many(resourceTable),
  })
);
