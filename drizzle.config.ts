import { defineConfig } from "drizzle-kit";

// Used only to generate SQL migrations (`npm run db:generate`).
// The app applies them itself on startup, against Railway Postgres or local PGlite.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
});
