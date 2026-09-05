import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const projectBriefs = pgTable(
  "project_briefs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 180 }).notNull(),
    company: varchar("company", { length: 160 }),
    projectType: varchar("project_type", { length: 80 }).notNull(),
    budget: varchar("budget", { length: 80 }).notNull(),
    details: text("details").notNull(),
    status: varchar("status", { length: 32 }).default("new").notNull(),
    locale: varchar("locale", { length: 12 }).default("ar").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("project_briefs_created_at_idx").on(table.createdAt)],
);

export type ProjectBrief = typeof projectBriefs.$inferSelect;
export type NewProjectBrief = typeof projectBriefs.$inferInsert;
