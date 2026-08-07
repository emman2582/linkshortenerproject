import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const links = pgTable("links", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  shortCode: varchar("short_code", { length: 20 }).notNull().unique(),
  url: text("url").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// reads as: "a Link" and "a new Link"
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
