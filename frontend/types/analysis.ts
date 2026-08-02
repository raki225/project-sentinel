import { z } from "zod"
import { documentTypeSchema } from "./document"
import { reportDataSchema } from "./report"

/** POST /api/upload response. */
export const uploadResponseSchema = z.object({
  success: z.literal(true),
  documentId: z.string(),
  fileName: z.string(),
  type: documentTypeSchema,
})
export type UploadResponse = z.infer<typeof uploadResponseSchema>

/** POST /api/analyze/:id response. */
export const analyzeResponseSchema = z.object({
  success: z.literal(true),
  documentId: z.string(),
  report: reportDataSchema,
})
export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>
