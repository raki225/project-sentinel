import cron from "node-cron";
import { env } from "../../config/env";
import { logger } from "../../utils/logger";
import { runGovDataSync } from "../govDataSyncService";

let running = false;

async function runGuarded(trigger: "startup" | "scheduled" | "manual"): Promise<void> {
  if (running) {
    logger.warn("Gov data sync already in progress, skipping overlapping trigger", { trigger });
    return;
  }
  running = true;
  try {
    logger.info("Gov data sync starting", { trigger });
    await runGovDataSync();
  } catch (error) {
    logger.error("Gov data sync threw unexpectedly", {
      trigger,
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    running = false;
  }
}

/**
 * Starts the 24h (default) government-data resync schedule. Also runs once
 * on startup by default (GOV_DATA_SYNC_ON_STARTUP) so a fresh deploy doesn't
 * sit empty for a full day before its first sync.
 */
export function startGovDataSyncScheduler(): void {
  if (!cron.validate(env.govData.syncCron)) {
    logger.error("Invalid GOV_DATA_SYNC_CRON expression, scheduler not started", {
      cron: env.govData.syncCron,
    });
    return;
  }

  cron.schedule(env.govData.syncCron, () => {
    void runGuarded("scheduled");
  });
  logger.info("Gov data sync scheduler started", { cron: env.govData.syncCron });

  if (env.govData.syncOnStartup) {
    void runGuarded("startup");
  }
}

export function triggerGovDataSyncNow(): Promise<void> {
  return runGuarded("manual");
}
