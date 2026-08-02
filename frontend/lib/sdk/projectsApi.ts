import { apiRequest } from "../api-client"
import { buildQuery } from "./shared"
import { projectsListResponseSchema, projectDetailResponseSchema, type ListProjectsParams } from "@/types/project"
import { projectsMapResponseSchema } from "@/types/report"

export const projectsApi = {
  list(params: ListProjectsParams = {}) {
    return apiRequest(
      `/projects${buildQuery({ page: params.page, limit: params.limit, state: params.state, department: params.department, status: params.status, q: params.q })}`,
      projectsListResponseSchema
    )
  },
  getById(id: string) {
    return apiRequest(`/projects/${id}`, projectDetailResponseSchema)
  },
  map() {
    return apiRequest("/projects/map", projectsMapResponseSchema)
  },
}
