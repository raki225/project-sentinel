import { apiRequest } from "../api-client"
import { uploadResponseSchema, analyzeResponseSchema } from "@/types/analysis"

export const analysisApi = {
  /** POST /api/upload — multipart, field name "file". */
  uploadDocument(file: File) {
    const formData = new FormData()
    formData.append("file", file)
    return apiRequest("/upload", uploadResponseSchema, { method: "POST", body: formData })
  },
  /** POST /api/analyze/:id — runs extraction + AI audit, upserts the Report. */
  analyzeDocument(documentId: string) {
    return apiRequest(`/analyze/${documentId}`, analyzeResponseSchema, { method: "POST" })
  },
}
