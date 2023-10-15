import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { userTable } from "./user";
import {
  RESOURCE_DESCRIPTION_MAX_LENGTH,
  RESOURCE_TITLE_MAX_LENGTH,
} from "../../config";
import getCurrentUTCDate from "../../utils/getCurrentUTCDate";

export const tempResourceTable = pgTable("temp_resource", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: varchar("title", { length: RESOURCE_TITLE_MAX_LENGTH }).notNull(),
  description: varchar("description", {
    length: RESOURCE_DESCRIPTION_MAX_LENGTH,
  }).notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id),
  category: text("category").notNull(),
  subCategory: text("subcategory").notNull(),
  createdAt: timestamp("created_at").default(getCurrentUTCDate()).notNull(),
  updatedAt: timestamp("updated_at").default(getCurrentUTCDate()).notNull(),
});

export const tempResourceTableRelations = relations(
  tempResourceTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [tempResourceTable.userId],
      references: [userTable.id],
    }),
  })
);
