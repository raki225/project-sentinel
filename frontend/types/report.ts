import { z } from "zod"
import { documentStatusSchema } from "./document"

export const geoLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  formattedAddress: z.string(),
})
export type GeoLocation = z.infer<typeof geoLocationSchema>

export const riskLevelSchema = z.enum(["Low", "Medium", "High", "Critical"])
export type RiskLevel = z.infer<typeof riskLevelSchema>

export const reportDataSchema = z.object({
  projectName: z.string(),
  department: z.string(),
  district: z.string(),
  contractor: z.string(),

  allocatedBudget: z.string(),
  spentAmount: z.string(),
  remainingBudget: z.string(),

  projectTimeline: z.string(),
  completionPercentage: z.string(),

  transparencyScore: z.number(),
  riskScore: z.number(),

  budgetHealth: z.number(),
  timelineHealth: z.number(),
  documentationHealth: z.number(),
  executionHealth: z.number(),

  riskLevel: z.string(),

  invoiceMismatch: z.boolean(),
  duplicateInvoice: z.boolean(),
  budgetOverrun: z.boolean(),
  timelineDelay: z.boolean(),

  missingEvidence: z.array(z.string()),
  anomalies: z.array(z.string()),
  recommendations: z.array(z.string()),
  paymentRecommendation: z.string(),

  confidence: z.number(),
  executiveSummary: z.string(),
  evidence: z.array(z.string()),

  location: geoLocationSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type ReportData = z.infer<typeof reportDataSchema>

export const reportResponseSchema = z.object({
  success: z.literal(true),
  documentId: z.string(),
  fileName: z.string(),
  status: documentStatusSchema,
  report: reportDataSchema,
})
export type ReportResponse = z.infer<typeof reportResponseSchema>

export const riskTierSchema = z.enum(["low", "medium", "high"])
export type RiskTier = z.infer<typeof riskTierSchema>

export const projectMapPointSchema = z.object({
  id: z.string(),
  lat: z.number(),
  lng: z.number(),
  name: z.string(),
  department: z.string(),
  district: z.string(),
  budget: z.string(),
  progress: z.string(),
  confidence: z.number(),
  riskScore: z.number(),
  risk: riskTierSchema,
  health: z.number(),
  formattedAddress: z.string(),
})
export type ProjectMapPoint = z.infer<typeof projectMapPointSchema>

export const projectsMapResponseSchema = z.object({
  success: z.literal(true),
  isDemo: z.boolean().optional(),
  points: z.array(projectMapPointSchema),
})
export type ProjectsMapResponse = z.infer<typeof projectsMapResponseSchema>
