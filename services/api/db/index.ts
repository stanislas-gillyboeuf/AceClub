import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema/index";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
});

// Enable pg_trgm extension for fuzzy search (similarity/word_similarity)
// Also create a GIN trigram index on organization names for performance
pool
  .query(
    `CREATE EXTENSION IF NOT EXISTS pg_trgm;
     CREATE INDEX IF NOT EXISTS idx_organization_name_trgm ON organization USING GIN (lower(name) gin_trgm_ops);`,
  )
  .catch((err: Error) => {
    console.warn("[db] pg_trgm setup skipped:", err.message);
  });

const db = drizzle(pool, {
  schema,
});

type Database = typeof db;

export { db, type Database };
