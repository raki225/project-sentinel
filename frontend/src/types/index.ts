export type RiskLevel = "low" | "medium" | "high" | "critical"

export type ProjectStatus =
  | "on_track"
  | "delayed"
  | "at_risk"
  | "completed"
  | "under_review"

export interface Project {
  id: string
  name: string
  department: string
  location: string
  district: string
  budgetAllocated: number
  budgetUtilized: number
  status: ProjectStatus
  riskLevel: RiskLevel
  aiConfidence: number
  progress: number
  startDate: string
  expectedCompletion: string
  contractor: string
  lat: number
  lng: number
  lastInspection: string
}

export type EvidenceType = "document" | "image" | "report" | "complaint" | "payment"

export interface Evidence {
  id: string
  type: EvidenceType
  title: string
  source: string
  timestamp: string
  excerpt: string
  url?: string
}

export type ReasoningStepKind = "observation" | "correlation" | "anomaly" | "conclusion"

export interface ReasoningStep {
  id: string
  kind: ReasoningStepKind
  title: string
  detail: string
  confidence: number
  citedEvidenceIds: string[]
}

export interface AIInsight {
  id: string
  projectId: string
  title: string
  summary: string
  riskLevel: RiskLevel
  confidence: number
  recommendation: string
  generatedAt: string
  evidence: Evidence[]
  reasoning: ReasoningStep[]
  tags: string[]
}

export type TimelineEventType =
  | "milestone"
  | "payment"
  | "inspection"
  | "report"
  | "complaint"
  | "ai_finding"

export interface TimelineEvent {
  id: string
  projectId: string
  type: TimelineEventType
  title: string
  description: string
  date: string
  riskLevel?: RiskLevel
  amount?: number
  evidenceIds?: string[]
}

export type ReportStatus = "draft" | "final" | "flagged"

export interface Report {
  id: string
  projectId: string
  title: string
  status: ReportStatus
  riskLevel: RiskLevel
  createdAt: string
  author: string
  summary: string
  pages: number
  images: string[]
}

export interface KpiSnapshot {
  totalProjects: number
  totalBudget: number
  budgetUtilized: number
  highRiskProjects: number
  avgAiConfidence: number
  inspectionsThisMonth: number
  activeAlerts: number
}

export interface Alert {
  id: string
  projectId: string
  title: string
  description: string
  riskLevel: RiskLevel
  createdAt: string
}
