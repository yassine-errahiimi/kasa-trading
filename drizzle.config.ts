import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Postgres connection string used for schema changes.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: { url },
});
