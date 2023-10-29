import { relations, sql } from "drizzle-orm";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { subCategoryTable } from "./subCategory";
import { CATEGORY_MAX_LENGTH, DEFAULT_CATEGORY_IMG_NAME } from "../../config";

export const categoryTable = pgTable("category", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: CATEGORY_MAX_LENGTH }).unique().notNull(),
  image: varchar("image").default(DEFAULT_CATEGORY_IMG_NAME).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const categoryTableRelations = relations(categoryTable, ({ many }) => ({
  subCategories: many(subCategoryTable),
}));
