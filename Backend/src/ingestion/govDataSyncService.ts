import { env } from "../config/env";
import { logger } from "../utils/logger";
import { Project } from "../models/Project";
import { GovDataSyncRun } from "../models/GovDataSyncRun";
import { AuditLog } from "../models/AuditLog";
import { geocodeLocation } from "../services/geocodingService";
import { enrichProject } from "../services/riskEnrichmentService";
import { fetchDataset } from "./fetchers";
import { normalizeProjectRecord } from "./normalizers/projectNormalizer";
import { loadDatasetSources, type DatasetSourceConfig } from "./config";
import { seedDemoProjectsIfEmpty } from "./demoSeed";

async function syncOneSource(config: DatasetSourceConfig): Promise<void> {
  const sourceDescriptor =
    config.kind === "gov-api" ? `${config.provider}:resource:${config.resourceId}` : `${config.provider}:file:${config.url}`;

  const run = await GovDataSyncRun.create({
    provider: config.provider,
    sourceDescriptor,
    status: "running",
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let rejected = 0;

  try {
    const { records } = await fetchDataset(
      config.kind === "gov-api"
        ? {
            kind: "gov-api",
            provider: config.provider,
            baseUrl: config.baseUrl ?? env.govData.apiBaseUrl,
            apiKey: env.govData.apiKey,
            resourceId: config.resourceId,
            pageSize: config.pageSize,
          }
        : { kind: "file-url", provider: config.provider, url: config.url, format: config.format }
    );

    for (const raw of records) {
      const normalized = normalizeProjectRecord(raw, config.fieldMap);
      if (!normalized) {
        rejected += 1;
        continue;
      }

      const identitySuffix = normalized.sourceRecordId ?? normalized.rawRecordHash.slice(0, 16);
      const externalId = `${sourceDescriptor}:${identitySuffix}`;

      const existing = await Project.findOne({ externalId });
      if (existing && existing.rawRecordHash === normalized.rawRecordHash) {
        skipped += 1;
        continue;
      }

      // Geocode only when the source dataset didn't already provide coordinates.
      let latitude = normalized.latitude;
      let longitude = normalized.longitude;
      if ((latitude === undefined || longitude === undefined) && (normalized.district || normalized.state)) {
        const geo = await geocodeLocation([normalized.district, normalized.state].filter(Boolean).join(", "));
        if (geo) {
          latitude = geo.lat;
          longitude = geo.lng;
        }
      }

      const doc = await Project.findOneAndUpdate(
        { externalId },
        {
          externalId,
          sourceProvider: config.provider,
          sourceDatasetId: config.kind === "gov-api" ? config.resourceId : config.url,
          sourceRecordId: normalized.sourceRecordId,
          rawRecordHash: normalized.rawRecordHash,
          isDemo: false,
          project: normalized.project,
          department: normalized.department,
          state: normalized.state,
          district: normalized.district,
          latitude,
          longitude,
          budget: normalized.budget,
          progress: normalized.progress,
          status: normalized.status,
          startDate: normalized.startDate,
          expectedCompletion: normalized.expectedCompletion,
          contractor: normalized.contractor,
          fundingSource: normalized.fundingSource,
        },
        { upsert: true, new: true }
      );

      if (existing) updated += 1;
      else created += 1;

      await enrichProject(doc);
    }

    await GovDataSyncRun.findByIdAndUpdate(run.id, {
      status: "success",
      recordsFetched: records.length,
      recordsCreated: created,
      recordsUpdated: updated,
      recordsSkipped: skipped,
      recordsRejected: rejected,
      finishedAt: new Date(),
    });

    await AuditLog.create({
      action: "govdata.sync",
      meta: { provider: config.provider, sourceDescriptor, created, updated, skipped, rejected },
    });

    logger.info("Gov data sync completed", { sourceDescriptor, created, updated, skipped, rejected });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await GovDataSyncRun.findByIdAndUpdate(run.id, {
      status: "failed",
      errorMessage: message,
      recordsCreated: created,
      recordsUpdated: updated,
      recordsSkipped: skipped,
      recordsRejected: rejected,
      finishedAt: new Date(),
    });
    logger.error("Gov data sync failed", { sourceDescriptor, error: message });
  }
}

/**
 * Runs every configured dataset source. When nothing is configured, records
 * a `skipped_not_configured` history entry and ensures the demo dataset is
 * present (clearly labeled `isDemo: true`) so `/api/projects` and
 * `/api/projects/map` never serve a silently-empty, unexplained response —
 * this is the honest fallback required by
 * docs/architecture/BACKEND_V2_ARCHITECTURE.md §11 / product requirement #12.
 */
export async function runGovDataSync(): Promise<void> {
  const sources = loadDatasetSources();

  if (sources.length === 0) {
    await GovDataSyncRun.create({
      provider: "none",
      sourceDescriptor: "GOV_DATA_SOURCES_FILE not configured",
      status: "skipped_not_configured",
      finishedAt: new Date(),
    });
    logger.warn(
      "No government data sources configured (GOV_DATA_SOURCES_FILE) — serving demo data only. " +
        "See Backend/config/gov-data-sources.example.json to configure a real dataset."
    );
    await seedDemoProjectsIfEmpty();
    return;
  }

  for (const source of sources) {
    await syncOneSource(source);
  }
}
