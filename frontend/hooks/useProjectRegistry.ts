"use client"

import { useProjects } from "./useProjects"
import { adaptBackendProject } from "@/lib/adapters/projectAdapter"
import { PROJECTS as DEMO_PROJECTS, type SentinelProject } from "@/lib/sentinel-data"

export interface ProjectRegistry {
  projects: SentinelProject[]
  isDemo: boolean
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  refetch: () => void
}

/**
 * The single source `/projects` and the Overview page's project grid read
 * from. Backend-first: when `GET /api/projects` reports `isDemo: false`
 * (real government data has been synced), every card renders real fields
 * through `adaptBackendProject`. When the backend reports `isDemo: true`
 * (nothing synced yet — true today, by default), this uses the existing,
 * full-fidelity local `sentinel-data.ts` set directly rather than the
 * leaner adapted shape, so the rendered UI is unchanged from before this
 * refactor. Either way, `ProjectCard` itself is never modified.
 */
export function useProjectRegistry(): ProjectRegistry {
  const query = useProjects({ limit: 100 })

  const backendIsDemo = query.data?.isDemo ?? false
  const projects: SentinelProject[] = !query.data
    ? []
    : backendIsDemo
      ? DEMO_PROJECTS
      : query.data.projects.map(adaptBackendProject)

  return {
    projects,
    isDemo: backendIsDemo,
    isLoading: query.isPending,
    isError: query.isError,
    errorMessage: query.error?.message ?? null,
    refetch: () => void query.refetch(),
  }
}
