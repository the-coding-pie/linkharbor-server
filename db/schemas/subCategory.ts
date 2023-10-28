import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { categoryTable } from "./category";
import { resourceTable } from "./resource";
import getCurrentUTCDate from "../../utils/getCurrentUTCDate";

export const subCategoryTable = pgTable("sub_category", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  image: varchar("image").default("sub_category.png").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoryTable.id),
  createdAt: timestamp("created_at").default(getCurrentUTCDate()).notNull(),
  updatedAt: timestamp("updated_at").default(getCurrentUTCDate()).notNull(),
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
