import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { user } from "../auth/schema";
import { ulid } from "ulid";

export const userE2eeKey = pgTable(
  "user_e2ee_key",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .unique(),
    publicKey: text("public_key").notNull(),
    encryptedPrivateKey: text("encrypted_private_key"),
    backupSalt: text("backup_salt"),
    keyVersion: integer("key_version").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("user_e2ee_key_userId_idx").on(table.userId)],
);
