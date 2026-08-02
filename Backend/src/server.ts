import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { startGovDataSyncScheduler } from "./ingestion/schedulers/govDataSyncScheduler";

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  app.listen(env.port, () => {
    logger.info(`Project Sentinel backend listening on http://localhost:${env.port}`);
    logger.info(`Swagger docs available at http://localhost:${env.port}/api-docs`);
  });

  startGovDataSyncScheduler();
}

main().catch((error) => {
  logger.error("Fatal startup error", { error: (error as Error).message });
  process.exit(1);
});
