import { createApp } from "./app";
import { env } from "./config/env";
import { db } from "./config/db";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`YaLoTengo API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down gracefully...`);
  server.close();
  await db.destroy();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
