import { apiRequest } from "../api-client"
import { buildQuery } from "./shared"
import { documentsResponseSchema, type ListDocumentsParams } from "@/types/document"

export const documentsApi = {
  list(params: ListDocumentsParams = {}) {
    return apiRequest(
      `/documents${buildQuery({ status: params.status, type: params.type, page: params.page, limit: params.limit })}`,
      documentsResponseSchema
    )
  },
}
