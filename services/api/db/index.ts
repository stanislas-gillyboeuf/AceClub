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

const db = drizzle(pool, {
  schema,
});

type Database = typeof db;

export { db, type Database };
