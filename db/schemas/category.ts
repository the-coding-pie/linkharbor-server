import { relations } from "drizzle-orm";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { subCategoryTable } from "./subCategory";

export const categoryTable = pgTable("category", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).unique().notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
});

export const categoryTableRelations = relations(categoryTable, ({ many }) => ({
  subCategories: many(subCategoryTable),
}));
