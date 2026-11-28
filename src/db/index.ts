import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";

/**
 * Database access for the whole app (Drizzle on top of Postgres).
 *
 * `DATABASE_URL` is read server-side only, from `.env` (never prefixed `NEXT_PUBLIC_`).
 * Use the pooled endpoint of your provider if it exposes one.
 */
export type Database = PgDatabase<PgQueryResultHKT>;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

export const databaseDriver = "node-postgres" as const;

const pool = new Pool({
  connectionString: databaseUrl,
  // Long-running Node server: a small pool is enough.
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000,
  keepAlive: true,
});

pool.on("error", (error) => {
  // An idle client can be dropped by the server; without a handler node-postgres
  // surfaces that as an uncaught error and crashes the process.
  console.warn("Idle database client error (connection will be re-established):", error.message);
});

const globalForDb = globalThis as typeof globalThis & { __kasaDatabase?: Database };

export const db: Database = globalForDb.__kasaDatabase ?? drizzle(pool);

if (process.env.NODE_ENV !== "production") {
  globalForDb.__kasaDatabase = db;
}
