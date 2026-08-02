import { apiRequest } from "../api-client"
import { liveActivityResponseSchema } from "@/types/activity"

export const activityApi = {
  live(limit = 20) {
    return apiRequest(`/activity/live?limit=${limit}`, liveActivityResponseSchema)
  },
}
