import path from "path";
import { parseCsv } from "./csvParser";
import { parseXlsx } from "./xlsxParser";
import { parseJson } from "./jsonParser";
import { parseXml } from "./xmlParser";
import { extractZip } from "./zipParser";
import { logger } from "../../utils/logger";

export type DatasetFormat = "csv" | "json" | "xlsx" | "xml" | "zip";

const EXTENSION_FORMAT: Record<string, DatasetFormat> = {
  ".csv": "csv",
  ".json": "json",
  ".xlsx": "xlsx",
  ".xls": "xlsx",
  ".xml": "xml",
  ".zip": "zip",
};

export function detectFormat(fileNameOrUrl: string): DatasetFormat | null {
  const ext = path.extname(fileNameOrUrl.split("?")[0]).toLowerCase();
  return EXTENSION_FORMAT[ext] ?? null;
}

/**
 * Parses any supported dataset format into a flat list of raw records.
 * ZIP archives are extracted and every recognizable entry inside is parsed
 * and concatenated — unrecognized entries (readme files, shapefiles, etc.)
 * are skipped with a log line rather than failing the whole ingestion.
 */
export function parseByFormat(
  buffer: Buffer,
  format: DatasetFormat,
  fileNameHint = ""
): Record<string, unknown>[] {
  switch (format) {
    case "csv":
      return parseCsv(buffer);
    case "json":
      return parseJson(buffer);
    case "xlsx":
      return parseXlsx(buffer);
    case "xml":
      return parseXml(buffer);
    case "zip": {
      const entries = extractZip(buffer);
      const records: Record<string, unknown>[] = [];
      for (const entry of entries) {
        const entryFormat = detectFormat(entry.fileName);
        if (!entryFormat || entryFormat === "zip") {
          logger.warn("Skipping unrecognized entry inside ZIP dataset", {
            zip: fileNameHint,
            entry: entry.fileName,
          });
          continue;
        }
        try {
          records.push(...parseByFormat(entry.buffer, entryFormat, entry.fileName));
        } catch (error) {
          logger.warn("Failed to parse entry inside ZIP dataset", {
            zip: fileNameHint,
            entry: entry.fileName,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      return records;
    }
  }
}
