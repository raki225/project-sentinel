import { fetchFromGovApi } from "./GovApiFetcher";
import { fetchFromFileUrl } from "./FileUrlFetcher";
import type { DatasetSource, FetchResult } from "./types";

export type { DatasetSource, FetchResult } from "./types";

export function fetchDataset(source: DatasetSource): Promise<FetchResult> {
  switch (source.kind) {
    case "gov-api":
      return fetchFromGovApi(source);
    case "file-url":
      return fetchFromFileUrl(source);
  }
}
