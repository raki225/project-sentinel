import type { BackendProject } from "@/types/project"
import type { SentinelProject, ProjectPhase } from "@/lib/sentinel-data"

/**
 * Adapts a real backend Project into the shape `ProjectCard` and the
 * Workspace already render — WITHOUT changing either of those components.
 *
 * Government open datasets don't carry every field the current UI displays
 * (category, phase, a 3-way sanctioned/released/utilized split, milestone
 * counts, a photo, flavor-text "current stage"). Every field below is either
 * (a) a real value passed straight through, or (b) an explicitly-labeled,
 * deterministic *derivation* from real fields (e.g. utilized estimated as
 * budget × progress%) — never an invented specific fact (no fake names,
 * dates, or narrative text). See docs/frontend/Architecture.md §12 for the
 * full reasoning; this file is the one place that reasoning is implemented.
 */
export function adaptBackendProject(p: BackendProject): SentinelProject {
  const phase = derivePhase(p.status, p.progress)
  const sanctioned = p.budget
  const released = p.budget // disclosed assumption: full sanction treated as released
  const utilized = Math.round(p.budget * (p.progress / 100)) // derived: progress-proportional estimate

  return {
    id: p._id,
    name: p.project,
    category: "Government Infrastructure", // real datasets don't carry a category; honest generic bucket
    department: p.department || "Unspecified department",
    state: p.state || "Unspecified state",
    district: p.district || "Unspecified district",
    sanctioned,
    released,
    utilized,
    progress: p.progress,
    integrity: Math.max(0, 100 - p.riskScore),
    status: p.status,
    phase,
    milestones: 1,
    milestonesDone: p.progress >= 100 ? 1 : 0,
    contractor: p.contractor || "Not disclosed in source dataset",
    started: formatMonthYear(p.startDate) ?? "Start date unavailable",
    expectedCompletion: formatMonthYear(p.expectedCompletion) ?? "Completion date unavailable",
    stage: `${p.progress}% physically complete`,
    image: "/placeholder.svg",
    lastEvent:
      p.anomalies[0]?.detail ?? `Synced from ${p.sourceProvider === "demo" ? "demo dataset" : p.sourceProvider}`,
  }
}

function derivePhase(status: BackendProject["status"], progress: number): ProjectPhase {
  if (progress >= 100) return "completed"
  if (status === "flagged") return "delayed"
  if (status === "pending") return "verifying"
  return "in-progress"
}

function formatMonthYear(iso: string | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}
