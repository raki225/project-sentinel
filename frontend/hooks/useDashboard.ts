"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/sdk"
import type { DashboardResponse } from "@/types/dashboard"
import type { ApiErrorInfo } from "@/types/api"

export function useDashboard() {
  return useQuery<DashboardResponse, ApiErrorInfo>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const result = await dashboardApi.get()
      if (!result.ok) throw result.error
      return result.data
    },
  })
}
