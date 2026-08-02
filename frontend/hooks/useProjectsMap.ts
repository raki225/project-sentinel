"use client"

import { useQuery } from "@tanstack/react-query"
import { projectsApi } from "@/lib/sdk"
import type { ProjectsMapResponse } from "@/types/report"
import type { ApiErrorInfo } from "@/types/api"

export function useProjectsMap() {
  return useQuery<ProjectsMapResponse, ApiErrorInfo>({
    queryKey: ["projects-map"],
    queryFn: async () => {
      const result = await projectsApi.map()
      if (!result.ok) throw result.error
      return result.data
    },
  })
}
