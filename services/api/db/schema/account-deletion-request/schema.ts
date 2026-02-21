import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const accountDeletionRequest = pgTable("account_deletion_request", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  clubName: text("club_name").notNull(),
  reason: text("reason"),
  status: text("status").default("pending").notNull(), // pending | processed | rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  processedBy: text("processed_by"),
});
