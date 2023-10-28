import { relations } from "drizzle-orm";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { subCategoryTable } from "./subCategory";
import getCurrentUTCDate from "../../utils/getCurrentUTCDate";

export const categoryTable = pgTable("category", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).unique().notNull(),
  image: varchar("image").default("category.png").notNull(),
  createdAt: timestamp("created_at").default(getCurrentUTCDate()).notNull(),
  updatedAt: timestamp("updated_at").default(getCurrentUTCDate()).notNull(),
});

export const categoryTableRelations = relations(categoryTable, ({ many }) => ({
  subCategories: many(subCategoryTable),
}));
