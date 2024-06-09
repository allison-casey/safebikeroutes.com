import { DB } from "kysely-codegen";
import { createKysely } from '@vercel/postgres-kysely';
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = process.env.NODE_ENV === 'development' ? new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: "db",
      host: "localhost",
      user: "postgres",
      password: "postgres",
      port: 5432,
      max: 10,
    })
  })
}) : createKysely<DB>();
