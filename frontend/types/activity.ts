import { z } from "zod"

export const activitySeveritySchema = z.enum(["low", "medium", "high"])
export type ActivitySeverity = z.infer<typeof activitySeveritySchema>

export const activityItemSchema = z.object({
  id: z.string(),
  action: z.string(),
  title: z.string(),
  severity: activitySeveritySchema,
  timestamp: z.string(),
})
export type ActivityItem = z.infer<typeof activityItemSchema>

export const liveActivityResponseSchema = z.object({
  success: z.literal(true),
  activity: z.array(activityItemSchema),
})
export type LiveActivityResponse = z.infer<typeof liveActivityResponseSchema>
