import { apiRequest } from "../api-client"
import { dashboardResponseSchema } from "@/types/dashboard"

export const dashboardApi = {
  get() {
    return apiRequest("/dashboard", dashboardResponseSchema)
  },
}
