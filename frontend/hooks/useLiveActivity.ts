"use client"

import { useQuery } from "@tanstack/react-query"
import { activityApi } from "@/lib/sdk"
import type { LiveActivityResponse } from "@/types/activity"
import type { ApiErrorInfo } from "@/types/api"

const POLL_INTERVAL_MS = 10_000

export function useLiveActivity(limit = 8) {
  return useQuery<LiveActivityResponse, ApiErrorInfo>({
    queryKey: ["live-activity", limit],
    queryFn: async () => {
      const result = await activityApi.live(limit)
      if (!result.ok) throw result.error
      return result.data
    },
    refetchInterval: POLL_INTERVAL_MS,
  })
}
