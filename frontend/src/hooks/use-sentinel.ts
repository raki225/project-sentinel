import { useQuery } from "@tanstack/react-query"
import {
  fetchAlerts,
  fetchBudgetTrend,
  fetchInspectionsTrend,
  fetchInsights,
  fetchInsightsForProject,
  fetchKpis,
  fetchProject,
  fetchProjects,
  fetchReport,
  fetchReports,
  fetchReportsForProject,
  fetchRiskDistribution,
  fetchTimelineForProject,
} from "@/services/sentinelApi"

export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: fetchProjects })
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id as string),
    enabled: Boolean(id),
  })
}

export function useKpis() {
  return useQuery({ queryKey: ["kpis"], queryFn: fetchKpis })
}

export function useBudgetTrend() {
  return useQuery({ queryKey: ["budget-trend"], queryFn: fetchBudgetTrend })
}

export function useRiskDistribution() {
  return useQuery({ queryKey: ["risk-distribution"], queryFn: fetchRiskDistribution })
}

export function useInspectionsTrend() {
  return useQuery({ queryKey: ["inspections-trend"], queryFn: fetchInspectionsTrend })
}

export function useAlerts() {
  return useQuery({ queryKey: ["alerts"], queryFn: fetchAlerts })
}

export function useInsights() {
  return useQuery({ queryKey: ["insights"], queryFn: fetchInsights })
}

export function useInsightsForProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ["insights", projectId],
    queryFn: () => fetchInsightsForProject(projectId as string),
    enabled: Boolean(projectId),
  })
}

export function useTimelineForProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ["timeline", projectId],
    queryFn: () => fetchTimelineForProject(projectId as string),
    enabled: Boolean(projectId),
  })
}

export function useReports() {
  return useQuery({ queryKey: ["reports"], queryFn: fetchReports })
}

export function useReport(id: string | undefined) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => fetchReport(id as string),
    enabled: Boolean(id),
  })
}

export function useReportsForProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ["reports", projectId],
    queryFn: () => fetchReportsForProject(projectId as string),
    enabled: Boolean(projectId),
  })
}
