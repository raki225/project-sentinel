"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Rows3,
  Layers,
  Building2,
  Landmark,
  ChevronDown,
  X,
  Compass,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { Reveal, Kicker, AnimatedNumber } from "@/components/sentinel/primitives"
import { ProjectCard } from "@/components/sentinel/project-card"
import { PHASE_META, formatCrore, transparencyTier, type ProjectPhase, type TransparencyTier } from "@/lib/sentinel-data"
import { useProjectRegistry } from "@/hooks/useProjectRegistry"
import { cn } from "@/lib/utils"

const CATEGORY_FILTERS = [
  "Roads & Highways",
  "Urban Transit",
  "Water & Sanitation",
  "Healthcare",
  "Education",
  "Energy",
  "Disaster Resilience",
  "Logistics",
]

const PHASE_FILTERS: ProjectPhase[] = ["planned", "in-progress", "completed", "delayed", "verifying"]
const TRANSPARENCY_FILTERS: TransparencyTier[] = ["High", "Medium", "Low"]

const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "budget-high", label: "Highest budget" },
  { key: "budget-low", label: "Lowest budget" },
  { key: "transparency-high", label: "Highest transparency" },
  { key: "transparency-low", label: "Lowest transparency" },
  { key: "completion", label: "Completion %" },
] as const

export default function ProjectsPage() {
  const { projects: PROJECTS, isDemo, isLoading, isError, errorMessage, refetch } = useProjectRegistry()
  const BUDGET_MAX = useMemo(() => (PROJECTS.length ? Math.max(...PROJECTS.map((p) => p.sanctioned)) : 0), [PROJECTS])

  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [phase, setPhase] = useState<ProjectPhase | null>(null)
  const [tier, setTier] = useState<TransparencyTier | null>(null)
  const [minBudget, setMinBudget] = useState(0)
  const [minCompletion, setMinCompletion] = useState(0)
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("newest")
  const [view, setView] = useState<"grid" | "list">("grid")

  const filtered = useMemo(() => {
    const list = PROJECTS.filter((p) => {
      if (category && p.category !== category) return false
      if (phase && p.phase !== phase) return false
      if (tier && transparencyTier(p.integrity) !== tier) return false
      if (p.sanctioned < minBudget) return false
      if (p.progress < minCompletion) return false
      if (
        query &&
        !`${p.name} ${p.district} ${p.state} ${p.contractor} ${p.id}`.toLowerCase().includes(query.toLowerCase())
      )
        return false
      return true
    })
    const sorted = [...list]
    switch (sort) {
      case "budget-high":
        sorted.sort((a, b) => b.sanctioned - a.sanctioned)
        break
      case "budget-low":
        sorted.sort((a, b) => a.sanctioned - b.sanctioned)
        break
      case "transparency-high":
        sorted.sort((a, b) => b.integrity - a.integrity)
        break
      case "transparency-low":
        sorted.sort((a, b) => a.integrity - b.integrity)
        break
      case "completion":
        sorted.sort((a, b) => b.progress - a.progress)
        break
      default:
        break
    }
    return sorted
  }, [PROJECTS, query, category, phase, tier, minBudget, minCompletion, sort])

  const activeFilters = [category, phase, tier].filter(Boolean).length + (minBudget > 0 ? 1 : 0) + (minCompletion > 0 ? 1 : 0)

  const resetAll = () => {
    setQuery("")
    setCategory(null)
    setPhase(null)
    setTier(null)
    setMinBudget(0)
    setMinCompletion(0)
  }

  const totalSanctioned = PROJECTS.reduce((s, p) => s + p.sanctioned, 0)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
      {/* Header */}
      <Reveal>
        <Kicker>Government Projects</Kicker>
        <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Government Infrastructure Projects
            </h1>
            <p className="mt-4 text-pretty text-muted-foreground">
              Explore, monitor and verify every government-funded infrastructure project through AI-powered
              transparency.
            </p>
          </div>
          <div className="flex gap-6">
            {[
              { k: "Projects", v: PROJECTS.length, suffix: "" },
              { k: "Verified", v: PROJECTS.filter((p) => p.status === "verified").length, suffix: "" },
              { k: "Under sanction", node: formatCrore(totalSanctioned) },
            ].map((s) => (
              <div key={s.k}>
                <div className="font-display text-2xl font-bold sm:text-3xl">
                  {s.node ? s.node : <AnimatedNumber value={s.v as number} suffix={s.suffix} />}
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Toolbar */}
      <Reveal delay={80}>
        <div className="mt-10 rounded-2xl border border-border bg-card p-4 sm:p-5">
          {/* Search + view + sort */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2.5">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by project name, district, state, contractor or project ID…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search projects"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear search" className="text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-border bg-background p-1">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  className={cn(
                    "grid size-8 place-items-center rounded-lg transition-colors",
                    view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  className={cn(
                    "grid size-8 place-items-center rounded-lg transition-colors",
                    view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Rows3 className="size-4" />
                </button>
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="appearance-none rounded-xl border border-border bg-background py-2.5 pl-3.5 pr-9 text-sm font-medium outline-none"
                  aria-label="Sort projects"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Category chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(null)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                !category ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Layers className="size-3.5" /> All categories
            </button>
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c === category ? null : c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  category === c ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Status + transparency + sliders */}
          <div className="mt-4 grid gap-4 border-t border-border pt-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Building2 className="size-3.5" /> Project status
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PHASE_FILTERS.map((ph) => (
                    <button
                      key={ph}
                      onClick={() => setPhase(ph === phase ? null : ph)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                        phase === ph ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {PHASE_META[ph].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Landmark className="size-3.5" /> Transparency
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRANSPARENCY_FILTERS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTier(t === tier ? null : t)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                        tier === t ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-muted-foreground">Min budget</span>
                  <span className="font-semibold">{minBudget === 0 ? "Any" : formatCrore(minBudget)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={BUDGET_MAX}
                  step={100}
                  value={minBudget}
                  onChange={(e) => setMinBudget(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                  aria-label="Minimum budget"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-muted-foreground">Min completion</span>
                  <span className="font-semibold">{minCompletion}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={minCompletion}
                  onChange={(e) => setMinCompletion(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                  aria-label="Minimum completion percentage"
                />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-muted">
            <Compass className="size-7 animate-pulse text-muted-foreground" />
          </div>
          <h3 className="mt-5 font-display text-xl font-bold">Loading projects…</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Fetching the latest project registry from Sentinel.
          </p>
        </div>
      ) : isError ? (
        <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-flagged/10">
            <AlertTriangle className="size-7 text-flagged" />
          </div>
          <h3 className="mt-5 font-display text-xl font-bold">Unable to load project list</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {errorMessage ?? "Something went wrong while reaching the Sentinel API."}
          </p>
          <button
            onClick={refetch}
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <RefreshCw className="size-4" /> Retry
          </button>
        </div>
      ) : (
        <>
          {isDemo && (
            <div className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              Demo mode — no government dataset synced yet
            </div>
          )}

          {/* Results header */}
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {PROJECTS.length}{" "}
              projects
            </div>
            {activeFilters > 0 && (
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40"
              >
                <X className="size-3.5" /> Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
              </button>
            )}
          </div>

          {/* Grid / list / empty */}
          <div className="mt-4">
            {filtered.length === 0 ? (
              <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center">
                <div className="grid size-16 place-items-center rounded-2xl bg-muted">
                  <Compass className="size-7 text-muted-foreground" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">No Infrastructure Projects Yet</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Government infrastructure projects will appear here for AI-powered transparency monitoring.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={resetAll}
                    className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/40"
                  >
                    Reset filters
                  </button>
                  <Link
                    href="/workspace"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                  >
                    Create First Project
                  </Link>
                </div>
              </div>
            ) : (
              <div className={cn(view === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4")}>
                {filtered.map((p, i) => (
                  <ProjectCard key={p.id} project={p} view={view} delay={i * 60} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
