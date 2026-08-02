import { apiRequest } from "../api-client"
import { reportResponseSchema } from "@/types/report"

export const reportsApi = {
  getByDocumentId(documentId: string) {
    return apiRequest(`/report/${documentId}`, reportResponseSchema)
  },
}
