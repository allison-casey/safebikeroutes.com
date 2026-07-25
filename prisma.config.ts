import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Set via direnv (.envrc), Vercel, or a local .env — required for migrate/db commands.
    url: process.env.POSTGRES_PRISMA_URL,
  },
});
