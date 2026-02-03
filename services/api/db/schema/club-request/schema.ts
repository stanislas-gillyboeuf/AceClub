import {
  pgTable,
  text,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const clubRequest = pgTable(
  "club_request",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    city: text("city").notNull(),
    requestCount: integer("request_count").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    status: text("status").default("pending").notNull(), // pending | approved | rejected
  },
  (table) => [
    uniqueIndex("club_request_name_city_uidx").on(table.name, table.city),
  ],
);
