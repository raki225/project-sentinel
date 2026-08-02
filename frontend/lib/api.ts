export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(body?.message ?? `Request failed with status ${res.status}`, res.status)
  }

  return body as T
}

export type DocumentType = "pdf" | "docx" | "png" | "jpg" | "jpeg"
export type DocumentStatus = "uploaded" | "processing" | "analyzed" | "failed"

export type DocumentSummary = {
  documentId: string
  fileName: string
  type: DocumentType
  status: DocumentStatus
  sizeBytes: number
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export type DocumentsResponse = {
  success: true
  documents: DocumentSummary[]
  pagination: { page: number; limit: number; total: number; pages: number }
}

export type GeoLocation = {
  lat: number
  lng: number
  formattedAddress: string
}

export type ReportData = {
  executiveSummary: string
  riskScore: number
  confidence: number
  timeline: string
  financial: Record<string, unknown>
  aiRecommendation: string
  projectName: string
  department: string
  district: string
  budget: string
  contractor: string
  progress: string
  risks: string[]
  missingInformation: string[]
  location?: GeoLocation
  createdAt: string
  updatedAt: string
}

export type ReportResponse = {
  success: true
  documentId: string
  fileName: string
  status: DocumentStatus
  report: ReportData
}

export function listDocuments(params?: { status?: DocumentStatus; type?: DocumentType; page?: number; limit?: number }) {
  const query = new URLSearchParams()
  if (params?.status) query.set("status", params.status)
  if (params?.type) query.set("type", params.type)
  if (params?.page) query.set("page", String(params.page))
  if (params?.limit) query.set("limit", String(params.limit))
  const qs = query.toString()
  return apiFetch<DocumentsResponse>(`/documents${qs ? `?${qs}` : ""}`)
}

export function getReport(documentId: string) {
  return apiFetch<ReportResponse>(`/report/${documentId}`)
}

export type RiskTier = "low" | "medium" | "high"

export type ProjectMapPoint = {
  id: string
  lat: number
  lng: number
  name: string
  department: string
  district: string
  budget: string
  progress: string
  confidence: number
  riskScore: number
  risk: RiskTier
  health: number
  formattedAddress: string
}

export function getProjectsMap() {
  return apiFetch<{ success: true; points: ProjectMapPoint[] }>("/projects/map")
}

export type ActivitySeverity = "low" | "medium" | "high"

export type ActivityItem = {
  id: string
  action: string
  title: string
  severity: ActivitySeverity
  timestamp: string
}

export function getLiveActivity(limit = 20) {
  return apiFetch<{ success: true; activity: ActivityItem[] }>(`/activity/live?limit=${limit}`)
}
