import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { resourceTable } from "./resource";
import { relations } from "drizzle-orm";
import getCurrentUTCDate from "../../utils/getCurrentUTCDate";

export const voteTable = pgTable("vote", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id),
  resourceId: integer("resource_id")
    .notNull()
    .references(() => resourceTable.id),
  createdAt: timestamp("created_at").default(getCurrentUTCDate()).notNull(),
});

export const voteTableRelations = relations(voteTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [voteTable.userId],
    references: [userTable.id],
  }),
  resource: one(resourceTable, {
    fields: [voteTable.resourceId],
    references: [resourceTable.id],
  }),
}));
