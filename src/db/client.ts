import { DB } from "kysely-codegen";
import { createKysely } from '@vercel/postgres-kysely';

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = createKysely<DB>();
