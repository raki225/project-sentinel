/**
 * Compatibility barrel — every backend request in this app flows through here.
 * The real implementation lives in `lib/api-client.ts` (the typed, validated,
 * ApiResult<T>-returning fetch layer) and `lib/sdk/*Api.ts` (per-domain SDK
 * modules). This file re-exports that SDK, plus legacy throw-based wrappers
 * for any existing call site still using the old contract, so nothing that
 * already imports from "@/lib/api" breaks.
 */
export { API_BASE_URL } from "./api-client"
export { projectsApi, documentsApi, activityApi, dashboardApi, reportsApi, analysisApi } from "./sdk"

export type {
  DocumentType,
  DocumentStatus,
  DocumentSummary,
  DocumentsResponse,
  ListDocumentsParams,
} from "@/types/document"
export type { GeoLocation, ReportData, ReportResponse, RiskTier, ProjectMapPoint, ProjectsMapResponse } from "@/types/report"
export type { ActivitySeverity, ActivityItem, LiveActivityResponse } from "@/types/activity"
export type {
  BackendProject,
  ProjectStatus,
  ProjectAnomaly,
  ProjectsListResponse,
  ListProjectsParams,
} from "@/types/project"
export type { DashboardResponse, DashboardProjectStats } from "@/types/dashboard"
export type { UploadResponse, AnalyzeResponse } from "@/types/analysis"

import { projectsApi, documentsApi, activityApi, reportsApi } from "./sdk"
import type { ListDocumentsParams } from "@/types/document"
import type { ApiResult } from "@/types/api"

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = "ApiError"
  }
}

function unwrapOrThrow<T>(result: ApiResult<T>): T {
  if (result.ok) return result.data
  throw new ApiError(result.error.message, result.error.status ?? 0)
}

/** @deprecated Prefer the `projectsApi`/`documentsApi`/etc. SDK objects, which never throw. */
export async function listDocuments(params?: ListDocumentsParams) {
  return unwrapOrThrow(await documentsApi.list(params))
}

/** @deprecated Prefer `reportsApi.getByDocumentId`, which never throws. */
export async function getReport(documentId: string) {
  return unwrapOrThrow(await reportsApi.getByDocumentId(documentId))
}

/** @deprecated Prefer `projectsApi.map()` (or the `useProjectsMap` hook), which never throws. */
export async function getProjectsMap() {
  return unwrapOrThrow(await projectsApi.map())
}

/** @deprecated Prefer `activityApi.live()` (or the `useLiveActivity` hook), which never throws. */
export async function getLiveActivity(limit = 20) {
  return unwrapOrThrow(await activityApi.live(limit))
}
