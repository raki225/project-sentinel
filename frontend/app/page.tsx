"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  ShieldCheck,
  ScanSearch,
  Landmark,
  Radio,
  TrendingUp,
  TriangleAlert as AlertTriangle,
  Search,
  Layers,
  Clock,
  Cpu,
  FileText,
  ArrowUpRight,
  MapPin,
  Gauge,
  SignalHigh,
} from "lucide-react"
import {
  Reveal,
  Kicker,
  AnimatedNumber,
  StatusPill,
  ProgressRing,
  CategoryIcon,
  SparkTimeline,
} from "@/components/sentinel/primitives"
import LiveActivityFeed from "@/components/sentinel/live-activity-feed"
import { PROJECTS, STATES, CATEGORIES, FUND_TIMELINE, formatCrore, type ProjectStatus } from "@/lib/sentinel-data"
import { cn } from "@/lib/utils"

const ProjectMap = dynamic(() => import("@/components/sentinel/project-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[300px] place-items-center rounded-xl border border-border bg-background/40">
      <span className="text-sm text-muted-foreground">Loading live map…</span>
    </div>
  ),
})

const STATUS_FILTERS: { key: ProjectStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "verified", label: "Verified" },
  { key: "pending", label: "Under review" },
  { key: "flagged", label: "Flagged" },
]

/* ---------- Live command clock ---------- */
function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const time = now
    ? now.toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--"
  return (
    <span className="font-mono tabular-nums text-foreground" suppressHydrationWarning>
      {time} IST
    </span>
  )
}

export default function OverviewPage() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<ProjectStatus | "all">("all")
  const [category, setCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      if (status !== "all" && p.status !== status) return false
      if (category && p.category !== category) return false
      if (query && !`${p.name} ${p.state} ${p.department} ${p.id}`.toLowerCase().includes(query.toLowerCase()))
        return false
      return true
    })
  }, [query, status, category])

  const flagged = PROJECTS.filter((p) => p.status === "flagged")
  const pending = PROJECTS.filter((p) => p.status === "pending")
  const recentlyVerified = PROJECTS.filter((p) => p.status === "verified").slice(0, 3)
  const totalSanctioned = FUND_TIMELINE.reduce((s, d) => s + d.sanctioned, 0)
  const totalVerified = FUND_TIMELINE.reduce((s, d) => s + d.verified, 0)
  const transparencyScore = Math.round((totalVerified / totalSanctioned) * 100)

  return (
    <div>
      {/* ============ COMMAND HEADER ============ */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-blueprint opacity-60" />
        <div className="pointer-events-none absolute -right-40 -top-52 size-[560px] rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 size-[420px] rounded-full bg-accent-teal/10 blur-3xl" />

        {/* Ops status strip */}
        <div className="relative border-b border-border/70 bg-background/40 backdrop-blur">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2.5 text-xs sm:px-6">
            <div className="flex items-center gap-2 font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5 text-verified">
                <span className="size-1.5 rounded-full bg-verified animate-pulse-dot" />
                SYSTEMS NOMINAL
              </span>
              <span className="hidden h-3 w-px bg-border sm:block" />
              <span className="hidden sm:inline">Sentinel Command Center</span>
            </div>
            <div className="flex items-center gap-x-5 gap-y-1 font-medium text-muted-foreground">
              <span className="hidden items-center gap-1.5 md:flex">
                <SignalHigh className="size-3.5 text-primary" /> Ledger sync 30s
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" /> <LiveClock />
              </span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          {/* Left — the guiding question, answered */}
          <div>
            <Reveal>
              <Kicker>National Infrastructure Intelligence</Kicker>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
                <span className="text-primary">
                  <AnimatedNumber value={transparencyScore} suffix="%" />
                </span>{" "}
                of sanctioned funds are verified against real-world evidence.
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                Monitoring 1,284 active projects
                <span className="size-1 rounded-full bg-muted-foreground" />
                Powered by explainable AI
              </p>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
                Every rupee is tracked from sanction to milestone. Sentinel cross-checks invoices, field photos and
                satellite imagery in real time — surfacing exactly where public money is working and where it is not.
              </p>
            </Reveal>

            {/* Live pillars */}
            <Reveal delay={220}>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Verified",
                    value: 87,
                    icon: ShieldCheck,
                    text: "text-verified",
                    bar: "bg-verified",
                  },
                  {
                    label: "Under review",
                    value: 9,
                    icon: Clock,
                    text: "text-pending",
                    bar: "bg-pending",
                  },
                  {
                    label: "Flagged",
                    value: 4,
                    icon: AlertTriangle,
                    text: "text-flagged",
                    bar: "bg-flagged",
                  },
                ].map((row) => (
                  <div key={row.label} className="rounded-xl border border-border bg-card/70 p-3.5 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <row.icon className={cn("size-4", row.text)} />
                      <span className={cn("font-display text-lg font-bold", row.text)}>
                        <AnimatedNumber value={row.value} suffix="%" />
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", row.bar)} style={{ width: `${row.value}%` }} />
                    </div>
                    <div className="mt-2 text-xs font-medium text-muted-foreground">{row.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  Open project registry
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/verification"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold transition-colors hover:border-primary/40"
                >
                  <ScanSearch className="size-4 text-primary" />
                  Verification console
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right — transparency gauge panel */}
          <Reveal delay={200}>
            <div className="relative rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Radio className="size-4 text-verified" />
                  National Transparency Score
                </div>
                <StatusPill status="verified">Live</StatusPill>
              </div>
              <div className="mt-6 flex items-center gap-6">
                <div className="relative grid place-items-center">
                  <ProgressRing value={transparencyScore} size={148} stroke={11} tone="primary" />
                  <div className="absolute text-center">
                    <div className="font-display text-4xl font-bold">
                      <AnimatedNumber value={transparencyScore} suffix="%" />
                    </div>
                    <div className="text-xs text-muted-foreground">verified spend</div>
                  </div>
                </div>
                <div className="flex-1 space-y-3.5">
                  {[
                    { label: "Sanctioned", value: formatCrore(totalSanctioned), tone: "text-foreground" },
                    { label: "Verified", value: formatCrore(totalVerified), tone: "text-verified" },
                    { label: "Awaiting audit", value: formatCrore(totalSanctioned - totalVerified), tone: "text-pending" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0">
                      <span className="text-xs text-muted-foreground">{row.label}</span>
                      <span className={cn("font-display text-sm font-bold", row.tone)}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5">
                {[
                  { k: "Projects", v: "1,284", icon: Landmark },
                  { k: "Audits today", v: "312", icon: Gauge },
                  { k: "Flags open", v: "47", icon: AlertTriangle },
                ].map((s) => (
                  <div key={s.k}>
                    <s.icon className="size-4 text-primary" />
                    <div className="mt-1.5 font-display text-lg font-bold">{s.v}</div>
                    <div className="text-xs text-muted-foreground">{s.k}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ SUMMARY WIDGETS ============ */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px overflow-hidden px-4 sm:px-6 lg:grid-cols-4">
          {[
            { label: "Funds tracked", value: 84240, prefix: "₹", suffix: " Cr", icon: TrendingUp },
            { label: "Projects monitored", value: 1284, icon: Landmark },
            { label: "AI verifications run", value: 92610, icon: ScanSearch },
            { label: "Irregularities flagged", value: 3172, icon: AlertTriangle },
          ].map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 80}
              className="group flex flex-col gap-2 py-10 transition-colors hover:bg-card/40 sm:items-start lg:px-8 [&:not(:last-child)]:lg:border-r [&:not(:last-child)]:lg:border-border"
            >
              <s.icon className="size-5 text-primary transition-transform group-hover:scale-110" />
              <div className="font-display text-3xl font-bold tracking-tight">
                <AnimatedNumber value={s.value} prefix={s.prefix ?? ""} suffix={s.suffix ?? ""} />
              </div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ LIVE OPS GRID — map + AI feed ============ */}
      <section className="border-b border-border bg-card/30">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1.35fr_1fr]">
          <Reveal>
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card/60 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <Kicker>Live monitoring map</Kicker>
                  <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-balance">
                    Projects under watch, right now
                  </h2>
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex">
                  <span className="size-1.5 rounded-full bg-verified animate-pulse-dot" /> Streaming
                </div>
              </div>
              <div className="mt-5 flex-1 rounded-xl border border-border bg-background/40 p-4">
                <ProjectMap height={300} showStats />
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card/60 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Cpu className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide">AI activity</h3>
                    <p className="text-xs text-muted-foreground">Sentinel engine · auto-updating</p>
                  </div>
                </div>
                <span className="size-2 rounded-full bg-verified animate-pulse-dot" />
              </div>
              <LiveActivityFeed />
              <Link
                href="/verification"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Full verification log <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ INFRASTRUCTURE CATEGORIES ============ */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <Kicker>Infrastructure categories</Kicker>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Where the money is building
              </h2>
            </div>
            <Link
              href="/projects"
              className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:inline-flex"
            >
              All projects <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.name} delay={i * 70}>
              <Link
                href="/projects"
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
                <div className="relative flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <CategoryIcon name={cat.icon} className="size-5" />
                  </span>
                  <ProgressRing value={cat.verifiedPct} size={44} stroke={4} tone="verified" />
                </div>
                <h3 className="relative mt-4 font-display text-base font-bold leading-tight">{cat.name}</h3>
                <div className="relative mt-3 flex items-center gap-4 text-sm">
                  <div>
                    <span className="font-display font-bold">{cat.count}</span>
                    <span className="ml-1 text-xs text-muted-foreground">projects</span>
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <div>
                    <span className="font-display font-bold">₹{cat.sanctioned.toLocaleString("en-IN")}</span>
                    <span className="ml-1 text-xs text-muted-foreground">Cr</span>
                  </div>
                </div>
                <div className="relative mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Explore <ArrowUpRight className="size-3" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ PROJECTS UNDER MONITORING — search + filters + cards ============ */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <Kicker>Projects under monitoring</Kicker>
                <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Find any project, instantly
                </h2>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-8 grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 transition-colors focus-within:border-primary/40">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by project, state, department or ID…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex rounded-xl border border-border bg-card p-1">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatus(f.key)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      status === f.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setCategory(null)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  !category
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <Layers className="size-3" /> All categories
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCategory(c.name === category ? null : c.name)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    category === c.name
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="mt-5 text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {PROJECTS.length}{" "}
            projects
          </div>

          {filtered.length === 0 ? (
            <div className="mt-4 grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
              <Search className="size-6 text-muted-foreground" />
              <p className="mt-3 font-display font-bold">No projects match your filters</p>
              <p className="mt-1 text-sm text-muted-foreground">Try clearing the search or choosing another category.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, 9).map((p, i) => {
                const tone = p.status === "flagged" ? "flagged" : p.status === "pending" ? "pending" : "verified"
                return (
                  <Reveal key={p.id} delay={i * 50}>
                    <Link
                      href="/workspace"
                      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <StatusPill status={tone as ProjectStatus}>
                            {p.status === "pending" ? "Under review" : p.status === "flagged" ? "Flagged" : "Verified"}
                          </StatusPill>
                          <span className="text-xs font-medium text-muted-foreground">{p.id}</span>
                        </div>
                        <ProgressRing value={p.integrity} size={48} stroke={4} tone={tone} />
                      </div>
                      <h3 className="mt-3 font-display text-lg font-bold leading-tight">{p.name}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" /> {p.state}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Landmark className="size-3" /> {p.category}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Sanctioned</div>
                          <div className="font-display font-bold">{formatCrore(p.sanctioned)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Progress</div>
                          <div className="font-display font-bold">{p.progress}%</div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        Open workspace <ArrowUpRight className="size-4" />
                      </div>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============ AWAITING + RECENTLY VERIFIED ============ */}
      <section className="mx-auto grid max-w-[1400px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <div className="flex items-center justify-between">
            <div>
              <Kicker>Awaiting verification</Kicker>
              <h3 className="mt-5 flex items-center gap-2 font-display text-xl font-bold">
                <Clock className="size-5 text-pending" />
                {pending.length} projects in queue
              </h3>
            </div>
            <StatusPill status="pending">Queue</StatusPill>
          </div>
          <div className="mt-6 space-y-3">
            {pending.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href="/workspace"
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-pending/50"
              >
                <ProgressRing value={p.integrity} size={52} stroke={5} tone="pending" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusPill status="pending">Review</StatusPill>
                    <span className="text-xs text-muted-foreground">{p.id}</span>
                  </div>
                  <p className="mt-1.5 truncate font-display text-sm font-bold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.lastEvent}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="flex items-center justify-between">
            <div>
              <Kicker>Recently verified</Kicker>
              <h3 className="mt-5 flex items-center gap-2 font-display text-xl font-bold">
                <ShieldCheck className="size-5 text-verified" />
                Cleared by Sentinel
              </h3>
            </div>
            <StatusPill status="verified">Cleared</StatusPill>
          </div>
          <div className="mt-6 space-y-3">
            {recentlyVerified.map((p) => (
              <Link
                key={p.id}
                href="/workspace"
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-verified/50"
              >
                <ProgressRing value={p.integrity} size={52} stroke={5} tone="verified" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusPill status="verified">Verified</StatusPill>
                    <span className="text-xs text-muted-foreground">{p.id}</span>
                  </div>
                  <p className="mt-1.5 truncate font-display text-sm font-bold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.lastEvent}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ FUND TIMELINE + STATE SNAPSHOT ============ */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <div>
              <Kicker>Fund utilization</Kicker>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Sanctioned vs verified, over time
              </h2>
              <p className="mt-4 max-w-lg text-muted-foreground">
                The gap between sanctioned and verified spend is what Sentinel closes — quarter by quarter, milestone by
                milestone.
              </p>
            </div>
            <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6">
              <div className="mb-5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-muted-foreground">
                  <span className="size-2.5 rounded-sm bg-primary/40" /> Sanctioned
                </span>
                <span className="flex items-center gap-2 font-medium text-muted-foreground">
                  <span className="size-2.5 rounded-sm bg-verified" /> Verified
                </span>
              </div>
              <SparkTimeline data={FUND_TIMELINE} />
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5">
                <div>
                  <div className="text-xs text-muted-foreground">Total sanctioned</div>
                  <div className="mt-1 font-display text-xl font-bold">
                    ₹{totalSanctioned.toLocaleString("en-IN")} Cr
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total verified</div>
                  <div className="mt-1 font-display text-xl font-bold text-verified">
                    ₹{totalVerified.toLocaleString("en-IN")} Cr
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div>
              <Kicker>State-wise snapshot</Kicker>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Where sanctioned funds are flowing
              </h2>
              <p className="mt-4 max-w-lg text-muted-foreground">
                Verified-spend ratio across every state currently under active monitoring.
              </p>
            </div>
            <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card/60 p-6">
              {STATES.map((state, i) => {
                const pct = [72, 63, 88, 41, 91, 55, 84, 47][i]
                const tone = pct >= 80 ? "bg-verified" : pct >= 55 ? "bg-primary" : "bg-flagged"
                return (
                  <Reveal key={state} delay={i * 40} className="flex items-center gap-4">
                    <span className="w-28 shrink-0 text-sm font-medium">{state}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all duration-1000", tone)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-sm font-semibold text-muted-foreground">{pct}%</span>
                  </Reveal>
                )
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ OPEN FLAGS — requires attention ============ */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <Kicker>Requires attention</Kicker>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">Open integrity flags</h2>
            </div>
            <Link
              href="/projects"
              className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:inline-flex"
            >
              View all projects <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {flagged.map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              <Link
                href="/workspace"
                className="group flex items-center gap-5 rounded-2xl border border-flagged/30 bg-flagged/5 p-5 transition-colors hover:border-flagged/60"
              >
                <ProgressRing value={p.integrity} size={64} stroke={6} tone="flagged" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusPill status="flagged">Flagged</StatusPill>
                    <span className="text-xs text-muted-foreground">{p.id}</span>
                  </div>
                  <h3 className="mt-2 truncate font-display font-bold">{p.name}</h3>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{p.lastEvent}</p>
                </div>
                <ArrowRight className="size-5 shrink-0 text-flagged transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  )
}
