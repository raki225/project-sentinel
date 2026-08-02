import { z } from "zod"

export const documentTypeSchema = z.enum(["pdf", "docx", "png", "jpg", "jpeg"])
export type DocumentType = z.infer<typeof documentTypeSchema>

export const documentStatusSchema = z.enum(["uploaded", "processing", "analyzed", "failed"])
export type DocumentStatus = z.infer<typeof documentStatusSchema>

export const documentSummarySchema = z.object({
  documentId: z.string(),
  fileName: z.string(),
  type: documentTypeSchema,
  status: documentStatusSchema,
  sizeBytes: z.number(),
  errorMessage: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type DocumentSummary = z.infer<typeof documentSummarySchema>

export const documentsResponseSchema = z.object({
  success: z.literal(true),
  documents: z.array(documentSummarySchema),
  pagination: z.object({ page: z.number(), limit: z.number(), total: z.number(), pages: z.number() }),
})
export type DocumentsResponse = z.infer<typeof documentsResponseSchema>

export interface ListDocumentsParams {
  status?: DocumentStatus
  type?: DocumentType
  page?: number
  limit?: number
}
