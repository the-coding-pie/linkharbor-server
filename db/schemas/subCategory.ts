import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { categoryTable } from "./category";
import { resourceTable } from "./resource";

export const subCategoryTable = pgTable("sub_category", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoryTable.id),
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
