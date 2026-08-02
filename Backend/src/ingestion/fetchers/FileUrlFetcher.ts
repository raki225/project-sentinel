import axios from "axios";
import { AppError } from "../../utils/AppError";
import { detectFormat, parseByFormat } from "../parsers";
import type { FetchResult, DatasetSource } from "./types";

const MAX_DOWNLOAD_BYTES = 200 * 1024 * 1024; // 200MB safety cap

/**
 * Downloads and parses any directly-linked dataset export — the mechanism
 * most open-data portals actually use (NDAP's downloadable datasets,
 * data.gov.in's per-resource CSV/JSON export links, PMGSY GeoSadak's open
 * data files, or any ministry's published CSV/XLSX/XML/ZIP). No API key
 * required; the URL itself is the required configuration.
 */
export async function fetchFromFileUrl(source: Extract<DatasetSource, { kind: "file-url" }>): Promise<FetchResult> {
  const format = source.format ?? detectFormat(source.url);
  if (!format) {
    throw new AppError(
      `Could not detect dataset format from URL "${source.url}" — set an explicit format override`,
      400
    );
  }

  let response;
  try {
    response = await axios.get<ArrayBuffer>(source.url, {
      responseType: "arraybuffer",
      timeout: 60_000,
      maxContentLength: MAX_DOWNLOAD_BYTES,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502;
      throw new AppError(`Failed to download dataset from ${source.url} (${status}): ${error.message}`, 502);
    }
    throw error;
  }

  const buffer = Buffer.from(response.data);
  const records = parseByFormat(buffer, format, source.url);

  return {
    records,
    sourceDescriptor: `${source.provider}:file:${source.url}`,
  };
}
