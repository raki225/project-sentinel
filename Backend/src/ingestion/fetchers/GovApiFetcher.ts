import axios from "axios";
import { AppError } from "../../utils/AppError";
import { logger } from "../../utils/logger";
import type { FetchResult, DatasetSource } from "./types";

const DEFAULT_PAGE_SIZE = 1000;
const MAX_PAGES = 200; // safety cap: 200 * 1000 = 200k records per sync, generous for any single resource

interface GovApiResponse {
  records?: Record<string, unknown>[];
  data?: Record<string, unknown>[];
  total?: number | string;
  count?: number | string;
}

/**
 * Fetches a dataset from a data.gov.in-compatible keyed resource API:
 *   GET {baseUrl}/resource/{resourceId}?api-key=...&format=json&limit=...&offset=...
 * This is the confirmed, documented data.gov.in OGD Platform contract
 * (see docs/architecture/BACKEND_V2_ARCHITECTURE.md §11) — every value here
 * (resourceId, apiKey) is required configuration, never hardcoded, since it
 * must point at a dataset you've verified and registered for yourself.
 */
export async function fetchFromGovApi(source: Extract<DatasetSource, { kind: "gov-api" }>): Promise<FetchResult> {
  const pageSize = source.pageSize ?? DEFAULT_PAGE_SIZE;
  const records: Record<string, unknown>[] = [];
  let offset = 0;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const url = `${source.baseUrl.replace(/\/+$/, "")}/resource/${source.resourceId}`;

    let response;
    try {
      response = await axios.get<GovApiResponse>(url, {
        params: { "api-key": source.apiKey, format: "json", limit: pageSize, offset },
        timeout: 30_000,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 502;
        throw new AppError(
          `Gov data API request failed (${status}) for resource ${source.resourceId}: ${error.message}`,
          502
        );
      }
      throw error;
    }

    const pageRecords = response.data.records ?? response.data.data ?? [];
    if (!Array.isArray(pageRecords)) {
      throw new AppError(
        `Gov data API returned an unexpected response shape for resource ${source.resourceId}`,
        502
      );
    }

    records.push(...pageRecords);
    logger.info("Gov data API page fetched", {
      resourceId: source.resourceId,
      page,
      pageRecords: pageRecords.length,
      totalSoFar: records.length,
    });

    if (pageRecords.length < pageSize) break; // last page
    offset += pageSize;
  }

  return {
    records,
    sourceDescriptor: `${source.provider}:resource:${source.resourceId}`,
  };
}
