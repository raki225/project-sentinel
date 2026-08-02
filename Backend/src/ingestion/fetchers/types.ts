import type { DatasetFormat } from "../parsers";

export interface FetchResult {
  records: Record<string, unknown>[];
  sourceDescriptor: string; // human-readable origin, stored on GovDataSyncRun for history/audit
}

/** One configured dataset to sync. `kind` picks which fetcher handles it. */
export type DatasetSource =
  | {
      kind: "gov-api";
      provider: string;
      /** e.g. "https://api.data.gov.in" */
      baseUrl: string;
      apiKey: string;
      /** the dataset's resource id, copied from its data.gov.in catalog page URL */
      resourceId: string;
      pageSize?: number;
    }
  | {
      kind: "file-url";
      provider: string;
      url: string;
      /** override auto-detection from the URL's extension when it's ambiguous */
      format?: DatasetFormat;
    };
