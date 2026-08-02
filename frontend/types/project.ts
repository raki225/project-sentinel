import { z } from "zod"

/** Mirrors Backend/src/models/Project.ts exactly — only fields real government open data actually provides. */
export const projectStatusSchema = z.enum(["verified", "pending", "flagged"])
export type ProjectStatus = z.infer<typeof projectStatusSchema>

export const projectAnomalySchema = z.object({
  type: z.enum(["budget_outlier", "timeline_delay", "duplicate_location", "suspicious_spending"]),
  detail: z.string(),
  severity: z.enum(["low", "medium", "high"]),
})
export type ProjectAnomaly = z.infer<typeof projectAnomalySchema>

export const backendProjectSchema = z.object({
  _id: z.string(),
  isDemo: z.boolean(),
  sourceProvider: z.string(),
  project: z.string(),
  department: z.string(),
  state: z.string(),
  district: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  budget: z.number(),
  progress: z.number(),
  status: projectStatusSchema,
  startDate: z.string().optional(),
  expectedCompletion: z.string().optional(),
  contractor: z.string().optional(),
  fundingSource: z.string().optional(),
  riskScore: z.number(),
  anomalies: z.array(projectAnomalySchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})
/** Exactly what `GET /api/projects` and `GET /api/projects/:id` return per record — real fields only, nothing invented. */
export type BackendProject = z.infer<typeof backendProjectSchema>

export const projectsListResponseSchema = z.object({
  success: z.literal(true),
  isDemo: z.boolean(),
  projects: z.array(backendProjectSchema),
  pagination: z.object({ page: z.number(), limit: z.number(), total: z.number(), pages: z.number() }),
})
export type ProjectsListResponse = z.infer<typeof projectsListResponseSchema>

export const projectDetailResponseSchema = z.object({
  success: z.literal(true),
  project: backendProjectSchema,
})
export type ProjectDetailResponse = z.infer<typeof projectDetailResponseSchema>

export interface ListProjectsParams {
  page?: number
  limit?: number
  state?: string
  department?: string
  status?: ProjectStatus
  q?: string
}
