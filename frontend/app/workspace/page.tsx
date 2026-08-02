"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft,
  MapPin,
  Building2,
  CalendarDays,
  ChevronDown,
  Check,
  LayoutGrid,
  FileText,
  Coins,
  Sparkles,
  ScrollText,
  Users,
  Wallet,
  Gauge,
  Activity,
  ShieldCheck,
} from "lucide-react"
import { StatusPill, ProgressRing, AnimatedNumber } from "@/components/sentinel/primitives"
import {
  OverviewPanel,
  VerificationPanel,
  ReportsPanel,
  CitizenPanel,
} from "@/components/sentinel/workspace-panels"
import { DocumentModulesPanel } from "@/components/sentinel/document-modules"
import { RupeeJourneyPanel } from "@/components/sentinel/rupee-journey"
import { PROJECTS, PHASE_META, formatCrore, type SentinelProject } from "@/lib/sentinel-data"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "Overview", Icon: LayoutGrid },
  { id: "Documents", Icon: FileText },
  { id: "Money Journey", Icon: Coins },
  { id: "AI Verification", Icon: Sparkles },
  { id: "Reports", Icon: ScrollText },
  { id: "Citizen View", Icon: Users },
] as const

type Tab = (typeof TABS)[number]["id"]

function toneForStatus(s: SentinelProject["status"]) {
  return s === "verified" ? "verified" : s === "flagged" ? "flagged" : "pending"
}

/* ---------- Project switcher ---------- */
function ProjectSwitcher({
  project,
  onSelect,
}: {
  project: SentinelProject
  onSelect: (p: SentinelProject) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:border-primary/40"
      >
        <span className="grid size-6 place-items-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
          {project.id.slice(-2)}
        </span>
        <span className="max-w-[160px] truncate">{project.name}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close project switcher"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-30 mt-2 max-h-[400px] w-80 overflow-auto rounded-2xl border border-border bg-popover p-1.5 shadow-2xl">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Switch project
            </div>
            {PROJECTS.map((p) => {
              const tone = toneForStatus(p.status)
              const active = p.id === project.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(p)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    active ? "bg-muted" : "hover:bg-muted/60",
                  )}
                >
                  <span className={cn("size-2 shrink-0 rounded-full", `bg-${tone}`)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {p.id} · {p.district}, {p.state}
                    </span>
                  </span>
                  {active && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default function WorkspacePage() {
  const [project, setProject] = useState<SentinelProject>(PROJECTS[0])
  const [tab, setTab] = useState<Tab>("Overview")

  const tone = toneForStatus(project.status)
  const phase = PHASE_META[project.phase]
  const aiStatus =
    project.status === "verified"
      ? { label: "AI Verified", tone: "verified" as const }
      : project.status === "flagged"
        ? { label: "AI Flagged", tone: "flagged" as const }
        : { label: "AI Verifying", tone: "pending" as const }

  const headerStats = [
    { label: "Budget", value: formatCrore(project.sanctioned), Icon: Wallet, tone: "primary" as const },
    { label: "Completion", value: `${project.progress}%`, Icon: Gauge, tone: tone },
    { label: "Current phase", value: phase.label, Icon: Activity, tone: phase.tone },
    { label: "AI status", value: aiStatus.label, Icon: ShieldCheck, tone: aiStatus.tone },
  ]

  return (
    <div>
      {/* ---------- Project Header ---------- */}
      <section className="relative overflow-hidden border-b border-border bg-card/40">
        <div className="absolute inset-0 grid-blueprint opacity-60" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1500px] px-4 pb-7 pt-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Back to projects
            </Link>
            <ProjectSwitcher project={project} onSelect={setProject} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={tone}>{project.id}</StatusPill>
                <span className="text-xs font-medium text-muted-foreground">{project.category}</span>
              </div>
              <h1 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {project.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" /> {project.district}, {project.state}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-4" /> {project.department}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" /> {project.started} — {project.expectedCompletion}
                </span>
              </div>
            </div>

            {/* Integrity ring */}
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="relative grid place-items-center">
                <ProgressRing value={project.integrity} size={84} stroke={8} tone={tone} />
                <div className="absolute text-center">
                  <div className="font-display text-lg font-bold">
                    <AnimatedNumber value={project.integrity} />
                  </div>
                  <div className="text-[10px] uppercase text-muted-foreground">integrity</div>
                </div>
              </div>
              <div className="text-sm">
                <div className="font-display font-bold">Transparency score</div>
                <p className="mt-0.5 max-w-[180px] text-xs leading-relaxed text-muted-foreground">
                  Live composite of document, satellite and ledger verification.
                </p>
              </div>
            </div>
          </div>

          {/* Header stat strip */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {headerStats.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", `bg-${s.tone}/12 text-${s.tone}`)}>
                  <s.Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
                  <div className="truncate font-display text-base font-bold">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Tabs ---------- */}
      <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
        <div
          role="tablist"
          aria-label="Project workspace sections"
          className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5"
        >
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <t.Icon className="size-4" />
                {t.id}
              </button>
            )
          })}
        </div>

        {/* Animated tab content */}
        <div key={`${project.id}-${tab}`} className="animate-tab-in mt-8">
          {tab === "Overview" && <OverviewPanel project={project} />}
          {tab === "Documents" && <DocumentModulesPanel project={project} />}
          {tab === "Money Journey" && <RupeeJourneyPanel project={project} />}
          {tab === "AI Verification" && <VerificationPanel project={project} />}
          {tab === "Reports" && <ReportsPanel project={project} />}
          {tab === "Citizen View" && <CitizenPanel project={project} />}
        </div>
      </section>
    </div>
  )
}
