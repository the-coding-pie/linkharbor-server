import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const resourcesTable = pgTable("resources", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: varchar("title", { length: 40 }).notNull(),
  description: varchar("description", { length: 60 }),
});
