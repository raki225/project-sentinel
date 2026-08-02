"use client"

import { useMemo, useState } from "react"
import {
  FileCheck2,
  FileWarning,
  FileClock,
  Satellite,
  ScanLine,
  Receipt,
  Landmark,
  ShieldCheck,
  CircleDollarSign,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Camera,
  MessageSquare,
  ThumbsUp,
  Download,
  FileText,
  Sparkles,
  Building2,
  CalendarDays,
  Hammer,
  Users,
  Fingerprint,
  Eye,
} from "lucide-react"
import {
  ProgressRing,
  StatusPill,
  AnimatedNumber,
} from "@/components/sentinel/primitives"
import {
  type SentinelProject,
  type ProjectStatus,
  formatCrore,
  transparencyTier,
  projectSummary,
} from "@/lib/sentinel-data"
import { cn } from "@/lib/utils"

/* ----------------------------------------------------------------
   Deterministic per-project content derivation (frontend only)
-----------------------------------------------------------------*/

type MilestonePhase = "done" | "active" | "upcoming"

export type Milestone = {
  title: string
  date: string
  phase: MilestonePhase
  detail: string
  funds: number
}

function toneForStatus(s: ProjectStatus) {
  return s === "verified" ? "verified" : s === "flagged" ? "flagged" : "pending"
}

export function buildMilestones(p: SentinelProject): Milestone[] {
  const templates = [
    { title: "Sanction & tender award", detail: "Contract awarded and mobilization advance released." },
    { title: "Site mobilization", detail: "Machinery, labour and site office established on ground." },
    { title: "Foundation & sub-structure", detail: "Earthwork, foundation and load-bearing base completed." },
    { title: "Primary construction", detail: p.stage },
    { title: "Systems & integration", detail: "Utilities, fittings and safety systems installed." },
    { title: "Quality inspection", detail: "Third-party and AI quality checks on delivered works." },
    { title: "Commissioning", detail: "Trial operations and performance validation." },
    { title: "Handover & closure", detail: "Final audit, citizen certification and ledger closure." },
  ]
  const total = Math.min(templates.length, Math.max(5, p.milestones))
  const done = Math.round((p.progress / 100) * total)
  const startYear = 2023
  return templates.slice(0, total).map((t, i) => {
    const phase: MilestonePhase = i < done ? "done" : i === done ? "active" : "upcoming"
    const quarter = (i % 4) + 1
    const year = startYear + Math.floor(i / 4)
    const funds = Math.round((p.sanctioned / total) * (i + 1))
    return {
      title: t.title,
      detail: t.detail,
      date: `Q${quarter} ${year}`,
      phase,
      funds,
    }
  })
}

type DocState = "verified" | "review" | "flagged"

export type WorkspaceDoc = {
  name: string
  type: string
  state: DocState
  size: string
  date: string
  confidence: number
}

export function buildDocuments(p: SentinelProject): WorkspaceDoc[] {
  const base: Omit<WorkspaceDoc, "state" | "confidence">[] = [
    { name: "Sanction Order & Budget Note", type: "Financial", size: "2.4 MB", date: p.started },
    { name: "Tender Award Agreement", type: "Legal", size: "5.1 MB", date: p.started },
    { name: "Milestone 3 Progress Certificate", type: "Progress", size: "1.8 MB", date: "Q3 2024" },
    { name: "Contractor Invoice Batch #4", type: "Financial", size: "0.9 MB", date: "Q4 2024" },
    { name: "Geo-tagged Site Photographs", type: "Evidence", size: "18.2 MB", date: "Q1 2025" },
    { name: "Satellite Verification Report", type: "AI Evidence", size: "3.3 MB", date: "Q1 2025" },
    { name: "Independent Quality Audit", type: "Audit", size: "4.7 MB", date: "Q2 2025" },
  ]
  return base.map((d, i) => {
    let state: DocState = "verified"
    let confidence = 92 + ((i * 3) % 7)
    if (p.status === "flagged" && (i === 3 || i === 6)) {
      state = "flagged"
      confidence = 44 + i
    } else if (p.status !== "verified" && i >= 5) {
      state = "review"
      confidence = 70 + i
    }
    return { ...d, state, confidence: Math.min(confidence, 99) }
  })
}

export type Tranche = {
  label: string
  amount: number
  date: string
  state: DocState
}

export function buildTranches(p: SentinelProject): Tranche[] {
  const n = 4
  const per = Math.round(p.released / n)
  return Array.from({ length: n }).map((_, i) => {
    const utilizedSoFar = per * (i + 1)
    let state: DocState = "verified"
    if (p.status === "flagged" && i === n - 1) state = "flagged"
    else if (utilizedSoFar > p.utilized) state = "review"
    return {
      label: `Tranche ${i + 1}`,
      amount: per,
      date: `Q${(i % 4) + 1} ${2023 + Math.floor(i / 2)}`,
      state,
    }
  })
}

const DOC_STATE_META: Record<DocState, { label: string; tone: "verified" | "pending" | "flagged"; Icon: typeof FileCheck2 }> = {
  verified: { label: "Verified", tone: "verified", Icon: FileCheck2 },
  review: { label: "Under review", tone: "pending", Icon: FileClock },
  flagged: { label: "Flagged", tone: "flagged", Icon: FileWarning },
}

/* ----------------------------------------------------------------
   Shared small pieces
-----------------------------------------------------------------*/

function PanelCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>{children}</div>
  )
}

function StatLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-right">{value}</span>
    </div>
  )
}

/* ----------------------------------------------------------------
   Overview panel — 3 columns
-----------------------------------------------------------------*/

export function OverviewPanel({ project }: { project: SentinelProject }) {
  const milestones = useMemo(() => buildMilestones(project), [project])
  const [selected, setSelected] = useState<number>(() =>
    Math.max(0, milestones.findIndex((m) => m.phase === "active")),
  )
  const tone = toneForStatus(project.status)
  const tier = transparencyTier(project.integrity)
  const idle = project.released - project.utilized

  const checks = [
    { label: "Documents authenticated", ok: project.status !== "flagged", Icon: FileCheck2 },
    { label: "Satellite geo-match confirmed", ok: project.integrity >= 70, Icon: Satellite },
    { label: "Ledger entries reconciled", ok: project.status === "verified", Icon: Landmark },
    { label: "Invoice cross-check passed", ok: project.status !== "flagged", Icon: Receipt },
  ]

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      {/* LEFT — Project Summary */}
      <div className="lg:col-span-3 space-y-5">
        <PanelCard>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Project Summary
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">{projectSummary(project)}</p>

          <div className="mt-4 divide-y divide-border/70">
            <StatLine label="Department" value={project.department} />
            <StatLine label="Contractor" value={project.contractor} />
            <StatLine
              label="Location"
              value={
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  {project.district}, {project.state}
                </span>
              }
            />
            <StatLine label="Started" value={project.started} />
            <StatLine label="Expected" value={project.expectedCompletion} />
            <StatLine
              label="Milestones"
              value={`${project.milestonesDone} of ${project.milestones}`}
            />
          </div>
        </PanelCard>

        <PanelCard className="flex items-center gap-4">
          <ProgressRing value={project.progress} tone={tone as any} size={72} stroke={7} />
          <div>
            <div className="font-display text-2xl font-bold">
              <AnimatedNumber value={project.progress} suffix="%" />
            </div>
            <div className="text-xs text-muted-foreground">Physical completion</div>
            <div className="mt-1 text-xs font-medium text-foreground/70">{project.stage}</div>
          </div>
        </PanelCard>
      </div>

      {/* CENTER — Interactive Project Timeline */}
      <div className="lg:col-span-6">
        <PanelCard className="h-full">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Project Timeline
            </h3>
            <StatusPill status={tone as any}>{project.milestonesDone}/{milestones.length} complete</StatusPill>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-[1.3fr_1fr]">
            {/* Timeline rail */}
            <ol className="relative ml-1 space-y-1 border-l border-border pl-5">
              {milestones.map((m, i) => {
                const active = selected === i
                const dotTone =
                  m.phase === "done"
                    ? "bg-verified border-verified"
                    : m.phase === "active"
                      ? "bg-primary border-primary"
                      : "bg-card border-border"
                return (
                  <li key={m.title} className="relative">
                    <button
                      type="button"
                      onClick={() => setSelected(i)}
                      className={cn(
                        "group w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                        active ? "bg-muted" : "hover:bg-muted/60",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute -left-[26px] top-3.5 grid size-3.5 place-items-center rounded-full border-2 transition-transform",
                          dotTone,
                          active && "scale-125",
                        )}
                      >
                        {m.phase === "active" && (
                          <span className="absolute inset-0 rounded-full bg-primary/50 animate-pulse-dot" />
                        )}
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-sm font-semibold", active && "text-primary")}>
                          {m.title}
                        </span>
                        <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                          {m.date}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {m.phase === "done" ? "Completed & verified" : m.phase === "active" ? "In progress" : "Upcoming"}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ol>

            {/* Selected milestone detail */}
            <div
              key={selected}
              className="animate-tab-in rounded-xl border border-border bg-muted/40 p-4"
            >
              <div className="flex items-center gap-2">
                {milestones[selected].phase === "done" ? (
                  <CheckCircle2 className="size-4 text-verified" />
                ) : milestones[selected].phase === "active" ? (
                  <Clock className="size-4 text-primary" />
                ) : (
                  <CalendarDays className="size-4 text-muted-foreground" />
                )}
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {milestones[selected].date}
                </span>
              </div>
              <h4 className="mt-2 font-display text-base font-bold text-balance">
                {milestones[selected].title}
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">
                {milestones[selected].detail}
              </p>
              <div className="mt-4 rounded-lg border border-border bg-card p-3">
                <div className="text-xs text-muted-foreground">Cumulative funds linked</div>
                <div className="mt-0.5 font-display text-lg font-bold">
                  {formatCrore(milestones[selected].funds)}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Fingerprint className="size-3.5" />
                Ledger anchored · immutable record
              </div>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* RIGHT — Transparency Status */}
      <div className="lg:col-span-3 space-y-5">
        <PanelCard className="text-center">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Transparency Status
          </h3>
          <div className="relative mx-auto mt-4 grid place-items-center">
            <ProgressRing value={project.integrity} tone={tone as any} size={128} stroke={10} />
            <div className="absolute flex flex-col items-center">
              <span className="font-display text-3xl font-bold">
                <AnimatedNumber value={project.integrity} />
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">integrity</span>
            </div>
          </div>
          <div className="mt-4">
            <StatusPill status={tone as any} className="mx-auto">
              {tier} transparency
            </StatusPill>
          </div>
        </PanelCard>

        <PanelCard>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Verification signals
          </h4>
          <ul className="mt-3 space-y-2.5">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2.5 text-sm">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-lg",
                    c.ok ? "bg-verified/12 text-verified" : "bg-flagged/12 text-flagged",
                  )}
                >
                  {c.ok ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
                </span>
                <span className="text-foreground/80">{c.label}</span>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Funds at a glance</h4>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Utilized</span><span className="font-semibold text-verified">{formatCrore(project.utilized)}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Idle in account</span><span className={cn("font-semibold", idle > project.released * 0.3 ? "text-pending" : "text-foreground")}>{formatCrore(idle)}</span></div>
          </div>
        </PanelCard>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------
   Documents panel
-----------------------------------------------------------------*/

export function DocumentsPanel({ project }: { project: SentinelProject }) {
  const docs = useMemo(() => buildDocuments(project), [project])
  const [active, setActive] = useState(0)
  const filters = ["All", "Financial", "Progress", "Evidence", "Audit"] as const
  const [filter, setFilter] = useState<(typeof filters)[number]>("All")

  const visible = docs.filter((d) => filter === "All" || d.type.includes(filter))
  const current = visible[active] ?? visible[0]

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <PanelCard>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f)
                setActive(0)
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filter === f
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {visible.map((d, i) => {
            const meta = DOC_STATE_META[d.state]
            const isActive = current === d
            return (
              <li key={d.name}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                    isActive
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-muted/50",
                  )}
                >
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", `bg-${meta.tone}/12 text-${meta.tone}`)}>
                    <meta.Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{d.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {d.type} · {d.size} · {d.date}
                    </span>
                  </span>
                  <StatusPill status={meta.tone} className="shrink-0">{meta.label}</StatusPill>
                </button>
              </li>
            )
          })}
        </ul>
      </PanelCard>

      {/* Document preview */}
      <PanelCard key={current?.name} className="animate-tab-in">
        <div className="aspect-[3/4] w-full overflow-hidden rounded-xl border border-border bg-muted/40 grid-blueprint-sm">
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="size-7" />
            </span>
            <div className="text-sm font-semibold text-balance">{current?.name}</div>
            <div className="text-xs text-muted-foreground">Encrypted document · AI-parsed</div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">AI confidence</span>
            <span className="font-display font-bold">{current?.confidence}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all duration-700", `bg-${DOC_STATE_META[current?.state ?? "verified"].tone}`)}
              style={{ width: `${current?.confidence ?? 0}%` }}
            />
          </div>
          <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary">
            <Download className="size-4" /> Download original
          </button>
        </div>
      </PanelCard>
    </div>
  )
}

/* ----------------------------------------------------------------
   Money Journey panel
-----------------------------------------------------------------*/

export function MoneyJourneyPanel({ project }: { project: SentinelProject }) {
  const tranches = useMemo(() => buildTranches(project), [project])
  const stages = [
    { label: "Sanctioned", value: project.sanctioned, Icon: Landmark, tone: "primary" },
    { label: "Released", value: project.released, Icon: CircleDollarSign, tone: "primary" },
    { label: "Utilized", value: project.utilized, Icon: Hammer, tone: "verified" },
    {
      label: "Verified spend",
      value: Math.round(project.utilized * (project.integrity / 100)),
      Icon: ShieldCheck,
      tone: "verified",
    },
  ] as const

  const max = stages[0].value

  return (
    <div className="space-y-5">
      <PanelCard>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Fund Journey — sanction to verified spend
        </h3>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {stages.map((s, i) => (
            <div key={s.label} className="relative">
              {i < stages.length - 1 && (
                <ArrowRight className="absolute -right-3 top-6 hidden size-5 text-muted-foreground/50 md:block" />
              )}
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <span className={cn("grid size-10 place-items-center rounded-lg", `bg-${s.tone}/12 text-${s.tone}`)}>
                  <s.Icon className="size-5" />
                </span>
                <div className="mt-3 font-display text-xl font-bold">
                  <AnimatedNumber value={s.value} prefix="₹" suffix=" Cr" />
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", `bg-${s.tone}`)}
                    style={{ width: `${(s.value / max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <PanelCard>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Disbursement tranches</h4>
          <ul className="mt-4 space-y-3">
            {tranches.map((t) => {
              const meta = DOC_STATE_META[t.state]
              return (
                <li key={t.label} className="flex items-center gap-4 rounded-xl border border-border p-3.5">
                  <span className={cn("grid size-10 place-items-center rounded-lg", `bg-${meta.tone}/12 text-${meta.tone}`)}>
                    <CircleDollarSign className="size-5" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{t.label}</span>
                      <span className="font-display text-sm font-bold">{formatCrore(t.amount)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{t.date}</div>
                  </div>
                  <StatusPill status={meta.tone}>{meta.label}</StatusPill>
                </li>
              )
            })}
          </ul>
        </PanelCard>

        <PanelCard>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Leakage check</h4>
          <div className="mt-4 grid place-items-center">
            <ProgressRing
              value={Math.round((stages[3].value / project.released) * 100)}
              tone={project.status === "flagged" ? "flagged" : "verified"}
              size={120}
              stroke={10}
            />
            <div className="-mt-[82px] text-center">
              <div className="font-display text-2xl font-bold">
                {Math.round((stages[3].value / project.released) * 100)}%
              </div>
              <div className="text-[11px] text-muted-foreground">of released funds<br />verified on ground</div>
            </div>
          </div>
          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
            {project.status === "flagged"
              ? "AI detected a gap between released funds and verifiable physical progress. Escalated for audit."
              : "Released funds are tracking closely with field-verified progress. No leakage detected."}
          </p>
        </PanelCard>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------
   AI Verification panel
-----------------------------------------------------------------*/

export function VerificationPanel({ project }: { project: SentinelProject }) {
  const steps = [
    { label: "Document OCR & parsing", Icon: ScanLine, base: 97 },
    { label: "Satellite geo-matching", Icon: Satellite, base: project.integrity },
    { label: "Invoice cross-verification", Icon: Receipt, base: project.status === "flagged" ? 48 : 94 },
    { label: "Progress estimation (CV)", Icon: Eye, base: Math.min(99, project.progress + 30) },
    { label: "Anomaly detection", Icon: AlertTriangle, base: project.status === "flagged" ? 55 : 96 },
  ]
  const findings =
    project.status === "flagged"
      ? [
          { tone: "flagged" as const, title: "Fund-to-progress mismatch", detail: `Released ${formatCrore(project.released)} vs field progress of ${project.progress}%.` },
          { tone: "flagged" as const, title: "Duplicate invoice signature", detail: "Two invoices share an identical vendor hash." },
          { tone: "pending" as const, title: "Awaiting site re-inspection", detail: "Drone survey scheduled to re-confirm works." },
        ]
      : [
          { tone: "verified" as const, title: "Evidence chain complete", detail: "All milestone documents cryptographically verified." },
          { tone: "verified" as const, title: "Geo-location confirmed", detail: `Satellite imagery matches declared site in ${project.district}.` },
          { tone: "pending" as const, title: "Next auto-audit queued", detail: "Scheduled after the upcoming milestone closure." },
        ]

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <PanelCard className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/15 to-transparent"
          style={{ animation: "sentinel-scan 3.5s ease-in-out infinite" }}
        />
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
            AI Verification Pipeline
          </h3>
        </div>
        <ul className="mt-5 space-y-4">
          {steps.map((s) => {
            const tone = s.base >= 85 ? "verified" : s.base >= 65 ? "pending" : "flagged"
            return (
              <li key={s.label} className="flex items-center gap-4">
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", `bg-${tone}/12 text-${tone}`)}>
                  <s.Icon className="size-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{s.label}</span>
                    <span className="font-display text-sm font-bold">{s.base}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full transition-all duration-1000", `bg-${tone}`)} style={{ width: `${s.base}%` }} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </PanelCard>

      <PanelCard>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI findings</h4>
        <ul className="mt-4 space-y-3">
          {findings.map((f) => (
            <li key={f.title} className={cn("rounded-xl border p-3.5", `border-${f.tone}/30 bg-${f.tone}/5`)}>
              <div className="flex items-center gap-2">
                {f.tone === "verified" ? (
                  <CheckCircle2 className={cn("size-4", `text-${f.tone}`)} />
                ) : f.tone === "flagged" ? (
                  <AlertTriangle className={cn("size-4", `text-${f.tone}`)} />
                ) : (
                  <Clock className={cn("size-4", `text-${f.tone}`)} />
                )}
                <span className="text-sm font-semibold">{f.title}</span>
              </div>
              <p className="mt-1 pl-6 text-xs leading-relaxed text-muted-foreground">{f.detail}</p>
            </li>
          ))}
        </ul>
      </PanelCard>
    </div>
  )
}

/* ----------------------------------------------------------------
   Reports panel
-----------------------------------------------------------------*/

export function ReportsPanel({ project }: { project: SentinelProject }) {
  const reports = [
    { title: "Financial Utilization Statement", desc: "Milestone-linked disbursement tracing.", pages: 24, tone: "verified" as const },
    { title: "Physical Progress Report", desc: "Field & CV-verified construction progress.", pages: 18, tone: "verified" as const },
    { title: "Integrity & Anomaly Summary", desc: `AI findings for ${project.id}.`, pages: 12, tone: project.status === "flagged" ? "flagged" : "verified" as const },
    { title: "Citizen Transparency Sheet", desc: "Plain-language public disclosure.", pages: 4, tone: "pending" as const },
  ]
  const formats = ["PDF", "CSV", "JSON", "XBRL"]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {reports.map((r) => (
        <PanelCard key={r.title} className="group flex flex-col transition-colors hover:border-primary/40">
          <div className="flex items-start justify-between gap-3">
            <span className={cn("grid size-11 place-items-center rounded-xl", `bg-${r.tone}/12 text-${r.tone}`)}>
              <FileText className="size-5" />
            </span>
            <StatusPill status={r.tone}>{r.tone === "flagged" ? "Attention" : r.tone === "pending" ? "Draft" : "Signed"}</StatusPill>
          </div>
          <h4 className="mt-4 font-display text-base font-bold text-balance">{r.title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
          <div className="mt-1 text-xs text-muted-foreground">{r.pages} pages</div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            {formats.map((f) => (
              <button
                key={f}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Download className="size-3.5" /> {f}
              </button>
            ))}
          </div>
        </PanelCard>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------------
   Citizen View panel
-----------------------------------------------------------------*/

export function CitizenPanel({ project }: { project: SentinelProject }) {
  const good = project.status !== "flagged"
  const [voted, setVoted] = useState(false)

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border p-6",
            good ? "border-verified/30 bg-verified/5" : "border-flagged/30 bg-flagged/5",
          )}
        >
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Is my money being used well?
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            {good ? (
              <CheckCircle2 className="size-9 text-verified" />
            ) : (
              <AlertTriangle className="size-9 text-flagged" />
            )}
            <div>
              <div className="font-display text-2xl font-bold">
                {good ? "Yes — on track" : "Under investigation"}
              </div>
              <div className="text-sm text-muted-foreground">
                {good
                  ? `${project.progress}% built with ${project.integrity}% verified spending.`
                  : "AI flagged a spending irregularity. Auditors are reviewing."}
              </div>
            </div>
          </div>
        </div>

        <PanelCard>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">In simple words</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Money set aside", value: formatCrore(project.sanctioned) },
              { label: "Actually spent", value: formatCrore(project.utilized) },
              { label: "Work finished", value: `${project.progress}%` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-muted/40 p-4 text-center">
                <div className="font-display text-xl font-bold text-primary">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/75">
            This {project.category.toLowerCase()} project in {project.district}, {project.state} is being
            built by {project.contractor}. Every rupee is tracked and independently checked by AI and
            satellite before it is marked as spent.
          </p>
        </PanelCard>
      </div>

      <div className="space-y-5">
        <PanelCard>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">On-ground photos</h4>
          <div className="mt-3 overflow-hidden rounded-xl border border-border">
            <img
              src={project.image || "/placeholder.svg"}
              alt={`Site photograph of ${project.name}`}
              className="aspect-video w-full object-cover"
            />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Camera className="size-3.5" /> Geo-tagged & timestamp verified
          </div>
        </PanelCard>

        <PanelCard>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your voice</h4>
          <button
            type="button"
            onClick={() => setVoted(true)}
            className={cn(
              "mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors",
              voted
                ? "border-verified/40 bg-verified/10 text-verified"
                : "border-border hover:border-primary/40 hover:text-primary",
            )}
          >
            <ThumbsUp className="size-4" /> {voted ? "Thanks for confirming!" : "I've seen this work locally"}
          </button>
          <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold transition-colors hover:border-flagged/40 hover:text-flagged">
            <MessageSquare className="size-4" /> Report an issue
          </button>
        </PanelCard>
      </div>
    </div>
  )
}
