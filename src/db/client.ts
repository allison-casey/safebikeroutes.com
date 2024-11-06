import { Pool, neonConfig } from "@neondatabase/serverless";
import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "kysely-codegen";
import ws from "ws";

// if we're running locally
if (!process.env.VERCEL_ENV) {
  // Set the WebSocket proxy to work with the local instance
  if (process.env.NODE_ENV === "development") {
    neonConfig.wsProxy = (host) => `${host}:5433/v1`;
  } else {
    neonConfig.wsProxy = (host) => `${host}:5435/v1`;
  }
  // Disable all authentication and encryption
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;

  // websocket doesn't exist in the test env
  if (process.env.NODE_ENV === "test") {
    neonConfig.webSocketConstructor = ws;
  }
}

export const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

// export const db = createKysely<DB>();
export const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
});
