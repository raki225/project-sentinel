"use client"

import { useQuery } from "@tanstack/react-query"
import { projectsApi } from "@/lib/sdk"
import type { ListProjectsParams, ProjectsListResponse } from "@/types/project"
import type { ApiErrorInfo } from "@/types/api"

/**
 * TanStack Query's `queryFn` is throw-based by convention (that's how it
 * populates `.error`/`isError`); `apiRequest` itself never throws. This is
 * the one, deliberate seam where the ApiResult convention is adapted into
 * react-query's — every hook in this folder follows the same pattern.
 */
export function useProjects(params: ListProjectsParams = {}) {
  return useQuery<ProjectsListResponse, ApiErrorInfo>({
    queryKey: ["projects", params],
    queryFn: async () => {
      const result = await projectsApi.list(params)
      if (!result.ok) throw result.error
      return result.data
    },
  })
}
