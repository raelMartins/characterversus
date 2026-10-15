import "server-only";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { migrate as migratePg } from "drizzle-orm/postgres-js/migrator";
import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

// Production (Railway) sets DATABASE_URL to its Postgres service.
// Locally, with no DATABASE_URL, we run an embedded Postgres (PGlite) stored in ./.data.

type Db = ReturnType<typeof drizzlePg<typeof schema>>;

const MIGRATIONS = path.join(process.cwd(), "drizzle");

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const postgres = (await import("postgres")).default;
    const client = postgres(url, { max: 10 });
    const db = drizzlePg(client, { schema });
    await migratePg(db, { migrationsFolder: MIGRATIONS });
    await seedIfEmpty(db);
    return db;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle: drizzleLite } = await import("drizzle-orm/pglite");
  const { migrate: migrateLite } = await import("drizzle-orm/pglite/migrator");
  const dataDir = path.join(process.cwd(), ".data");
  await mkdir(dataDir, { recursive: true });
  const client = new PGlite(path.join(dataDir, "pglite"));
  const db = drizzleLite(client, { schema });
  await migrateLite(db, { migrationsFolder: MIGRATIONS });
  // Both drivers expose the same query builder; the cast keeps one Db type across the app.
  const shared = db as unknown as Db;
  await seedIfEmpty(shared);
  return shared;
}

const globalForDb = globalThis as unknown as { __dbPromise?: Promise<Db> };

export function getDb(): Promise<Db> {
  if (!globalForDb.__dbPromise) {
    globalForDb.__dbPromise = connect().catch((err) => {
      globalForDb.__dbPromise = undefined;
      throw err;
    });
  }
  return globalForDb.__dbPromise;
}

export { schema };
export type { Db };
