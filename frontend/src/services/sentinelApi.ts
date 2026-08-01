import {
  alerts,
  budgetTrend,
  inspectionsTrend,
  insights,
  kpiSnapshot,
  projects,
  reports,
  riskDistribution,
  getInsightsForProject,
  getProject,
  getReport,
  getReportsForProject,
  getTimelineForProject,
} from "@/data/mock"

// Simulated network latency so loading/skeleton states are demoable.
// Swap the bodies of these functions for real `fetch` calls once the
// Upload / Analyze / Report APIs are live — the React Query hooks in
// `hooks/use-sentinel.ts` don't need to change.
const delay = (ms = 380) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchProjects() {
  await delay()
  return projects
}

export async function fetchProject(id: string) {
  await delay(250)
  const project = getProject(id)
  if (!project) throw new Error(`Project ${id} not found`)
  return project
}

export async function fetchKpis() {
  await delay(300)
  return kpiSnapshot
}

export async function fetchBudgetTrend() {
  await delay(300)
  return budgetTrend
}

export async function fetchRiskDistribution() {
  await delay(300)
  return riskDistribution
}

export async function fetchInspectionsTrend() {
  await delay(300)
  return inspectionsTrend
}

export async function fetchAlerts() {
  await delay(250)
  return alerts
}

export async function fetchInsights() {
  await delay(350)
  return insights
}

export async function fetchInsightsForProject(projectId: string) {
  await delay(300)
  return getInsightsForProject(projectId)
}

export async function fetchTimelineForProject(projectId: string) {
  await delay(300)
  return getTimelineForProject(projectId)
}

export async function fetchReports() {
  await delay(300)
  return reports
}

export async function fetchReportsForProject(projectId: string) {
  await delay(250)
  return getReportsForProject(projectId)
}

export async function fetchReport(id: string) {
  await delay(250)
  const report = getReport(id)
  if (!report) throw new Error(`Report ${id} not found`)
  return report
}

export interface UploadTask {
  id: string
  file: File
}

export type UploadStage = "queued" | "uploading" | "processing" | "done" | "error"

export async function simulateUpload(
  _task: UploadTask,
  onProgress: (percent: number, stage: UploadStage) => void,
) {
  onProgress(0, "uploading")
  for (let percent = 0; percent <= 100; percent += Math.round(8 + Math.random() * 10)) {
    await delay(90)
    onProgress(Math.min(percent, 100), "uploading")
  }
  onProgress(100, "processing")
  await delay(900)
  onProgress(100, "done")
}
