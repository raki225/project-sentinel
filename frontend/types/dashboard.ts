import { z } from "zod"
import { documentStatusSchema, documentTypeSchema } from "./document"
import { projectStatusSchema } from "./project"

export const dashboardProjectStatsSchema = z.object({
  isDemo: z.boolean(),
  total: z.number(),
  statusCounts: z.object({ verified: z.number(), pending: z.number(), flagged: z.number() }),
  averageRiskScore: z.number(),
  byState: z.record(z.string(), z.number()),
  byDepartment: z.record(z.string(), z.number()),
  recentProjects: z.array(
    z.object({
      projectId: z.string(),
      name: z.string(),
      state: z.string(),
      department: z.string(),
      status: projectStatusSchema,
      riskScore: z.number(),
    })
  ),
})
export type DashboardProjectStats = z.infer<typeof dashboardProjectStatsSchema>

export const dashboardResponseSchema = z.object({
  success: z.literal(true),
  projects: dashboardProjectStatsSchema,
  stats: z.object({
    totalDocuments: z.number(),
    totalReports: z.number(),
    statusCounts: z.record(z.string(), z.number()).optional(),
    typeCounts: z.record(z.string(), z.number()).optional(),
    averageRiskScore: z.number(),
    averageConfidence: z.number(),
    highRiskCount: z.number(),
  }),
  recentDocuments: z.array(
    z.object({
      documentId: z.string(),
      fileName: z.string(),
      type: documentTypeSchema,
      status: documentStatusSchema,
      createdAt: z.string(),
    })
  ),
})
export type DashboardResponse = z.infer<typeof dashboardResponseSchema>
