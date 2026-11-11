import { attachDatabasePool } from "@vercel/functions";
import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "kysely-codegen";
import { Pool } from "pg";

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Lets Vercel Fluid compute close idle connections before a function suspends
attachDatabasePool(pool);

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
});
