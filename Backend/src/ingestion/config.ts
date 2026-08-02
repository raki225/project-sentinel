import fs from "fs";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import type { DatasetFormat } from "./parsers";
import type { ProjectFieldMap } from "./normalizers/projectNormalizer";

export interface GovApiSourceConfig {
  kind: "gov-api";
  provider: string;
  /** defaults to env.govData.apiBaseUrl if omitted */
  baseUrl?: string;
  resourceId: string;
  pageSize?: number;
  fieldMap: ProjectFieldMap;
}

export interface FileUrlSourceConfig {
  kind: "file-url";
  provider: string;
  url: string;
  format?: DatasetFormat;
  fieldMap: ProjectFieldMap;
}

export type DatasetSourceConfig = GovApiSourceConfig | FileUrlSourceConfig;

/**
 * Reads the list of datasets to sync from a JSON config file (path set via
 * GOV_DATA_SOURCES_FILE). Deliberately NOT hardcoded to any specific
 * resource ID or dataset URL — see docs/architecture/BACKEND_V2_ARCHITECTURE.md
 * §11 for why: no live Indian government dataset endpoint could be verified
 * reachable from the environment this was built in, so shipping a guessed
 * resource ID would risk pointing at something that doesn't exist or has
 * moved. You configure real, verified datasets here yourself.
 *
 * API keys are never stored in this file — gov-api sources pull the shared
 * key from GOV_DATA_API_KEY at sync time.
 *
 * Returns [] (not an error) when unconfigured, so the rest of the system
 * degrades gracefully to demo data rather than crashing.
 */
export function loadDatasetSources(): DatasetSourceConfig[] {
  const filePath = env.govData.sourcesFile;
  if (!filePath) return [];

  if (!fs.existsSync(filePath)) {
    logger.warn("GOV_DATA_SOURCES_FILE is set but the file does not exist", { filePath });
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Expected a JSON array of dataset source configs");
    }
    return parsed as DatasetSourceConfig[];
  } catch (error) {
    logger.error("Failed to load GOV_DATA_SOURCES_FILE", {
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
