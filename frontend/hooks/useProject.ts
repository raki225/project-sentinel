"use client"

import { useQuery } from "@tanstack/react-query"
import { projectsApi } from "@/lib/sdk"
import type { ProjectDetailResponse } from "@/types/project"
import type { ApiErrorInfo } from "@/types/api"

export function useProject(id: string | undefined) {
  return useQuery<ProjectDetailResponse, ApiErrorInfo>({
    queryKey: ["project", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const result = await projectsApi.getById(id as string)
      if (!result.ok) throw result.error
      return result.data
    },
  })
}
