import type { RiskLevel } from "@/types"

export function formatCrore(amountInRupees: number): string {
  const crore = amountInRupees / 1_00_00_000
  return `₹${crore.toLocaleString("en-IN", { maximumFractionDigits: 1 })}Cr`
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${(value * 100).toFixed(fractionDigits)}%`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const riskTokens: Record<RiskLevel, { label: string; color: string; bg: string; dot: string }> = {
  low: { label: "Low", color: "text-success", bg: "bg-success/10", dot: "bg-success" },
  medium: { label: "Medium", color: "text-warning", bg: "bg-warning/10", dot: "bg-warning" },
  high: { label: "High", color: "text-danger", bg: "bg-danger/10", dot: "bg-danger" },
  critical: { label: "Critical", color: "text-danger", bg: "bg-danger/15", dot: "bg-danger" },
}

export const statusTokens: Record<string, { label: string; color: string; bg: string }> = {
  on_track: { label: "On Track", color: "text-success", bg: "bg-success/10" },
  delayed: { label: "Delayed", color: "text-warning", bg: "bg-warning/10" },
  at_risk: { label: "At Risk", color: "text-danger", bg: "bg-danger/10" },
  completed: { label: "Completed", color: "text-accent", bg: "bg-accent/10" },
  under_review: { label: "Under Review", color: "text-muted-foreground", bg: "bg-muted" },
}
