"use client"

import Link from "next/link"
import Image from "next/image"
import { useMemo, useRef, useState } from "react"
import {
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  BadgeCheck,
  Wallet,
  Star,
  Bookmark,
  Share2,
  MoreHorizontal,
  ChevronDown,
  CalendarClock,
  HardHat,
  Users,
  ScrollText,
  Sparkles,
  AlertTriangle,
} from "lucide-react"
import {
  AnimatedNumber,
  CategoryIcon,
  ProgressRing,
  StatusPill,
} from "@/components/sentinel/primitives"
import {
  CATEGORY_ICON_KEY,
  PHASE_META,
  formatCrore,
  fundingStatus,
  projectSummary,
  qualityStatus,
  transparencyTier,
  type SentinelProject,
} from "@/lib/sentinel-data"
import { MAP_POINTS } from "@/lib/sentinel-data"
import { cn } from "@/lib/utils"

type Ripple = { id: number; x: number; y: number; size: number }

/* Ripple-enabled surface used for the card actions */
function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const add = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const id = Date.now() + Math.random()
    setRipples((r) => [
      ...r,
      { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size },
    ])
    window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 620)
  }
  const layer = (
    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-current opacity-25"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            animation: "sentinel-ripple 0.6s ease-out forwards",
          }}
        />
      ))}
    </span>
  )
  return { add, layer }
}

function IconToggle({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground",
        active && "border-primary/50 bg-primary/10 text-primary",
      )}
    >
      {children}
    </button>
  )
}

/* Compact per-project location map preview */
function MiniMap({ id, tone }: { id: string; tone: string }) {
  const point = MAP_POINTS.find((p) => p.id === id) ?? { x: 50, y: 50 }
  const dot =
    tone === "verified" ? "bg-verified" : tone === "flagged" ? "bg-flagged" : "bg-pending"
  return (
    <div className="relative aspect-[5/3] w-full overflow-hidden rounded-lg border border-border bg-muted/40">
      <svg viewBox="0 0 100 60" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={`mini-grid-${id}`} width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M 6 0 L 0 0 0 6" fill="none" stroke="var(--border)" strokeWidth="0.25" />
          </pattern>
        </defs>
        <rect width="100" height="60" fill={`url(#mini-grid-${id})`} />
        <path
          d="M14 16 Q24 8 36 12 Q50 8 60 15 Q74 12 82 22 Q88 32 80 42 Q70 52 54 50 Q40 56 28 48 Q16 44 14 30 Q10 22 14 16 Z"
          fill="color-mix(in oklch, var(--primary) 10%, var(--background))"
          stroke="color-mix(in oklch, var(--primary) 28%, transparent)"
          strokeWidth="0.5"
        />
      </svg>
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${point.x}%`, top: `${(point.y / 75) * 60}%` }}
      >
        <span className={cn("block size-2 rounded-full ring-4 ring-current/20", dot)}>
          <span className={cn("absolute inset-0 block rounded-full", dot)} style={{ animation: "sentinel-pulse 2.4s ease-in-out infinite" }} />
        </span>
      </span>
    </div>
  )
}

export function ProjectCard({
  project,
  view = "grid",
  delay = 0,
}: {
  project: SentinelProject
  view?: "grid" | "list"
  delay?: number
}) {
  const [fav, setFav] = useState(false)
  const [marked, setMarked] = useState(false)
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const ripple = useRipple()

  const p = project
  const tone: "verified" | "pending" | "flagged" =
    p.status === "flagged" ? "flagged" : p.status === "pending" ? "pending" : "verified"
  const remaining = Math.max(p.sanctioned - p.utilized, 0)
  const utilPct = Math.round((p.utilized / p.sanctioned) * 100)
  const tier = transparencyTier(p.integrity)
  const quality = useMemo(() => qualityStatus(p), [p])
  const funding = useMemo(() => fundingStatus(p), [p])
  const phase = PHASE_META[p.phase]
  const iconKey = CATEGORY_ICON_KEY[p.category] ?? "road"
  const tierTone = tier === "High" ? "verified" : tier === "Medium" ? "pending" : "flagged"
  const riskTone = tone === "verified" ? "verified" : tone === "pending" ? "pending" : "flagged"
  const riskLabel = tone === "verified" ? "Low risk" : tone === "pending" ? "Medium risk" : "High risk"

  const budgetRows = [
    { l: "Sanctioned", v: p.sanctioned },
    { l: "Released", v: p.released },
    { l: "Utilized", v: p.utilized },
    { l: "Remaining", v: remaining },
  ]

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5",
        view === "list" && "sm:flex-row",
      )}
      style={{ animation: "sentinel-rise 0.6s cubic-bezier(0.22,1,0.36,1) both", animationDelay: `${delay}ms` }}
    >
      {/* Banner */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden",
          view === "list" ? "h-44 sm:h-auto sm:w-64" : "h-44",
        )}
      >
        <Image
          src={p.image || "/placeholder.svg"}
          alt={`${p.name} construction site`}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent" />
        {/* top badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/70 px-2 py-1 text-xs font-medium backdrop-blur">
            <CategoryIcon name={iconKey} className="size-3.5 text-primary" />
            {p.category}
          </span>
          <StatusPill status={phase.tone} className="bg-background/70 backdrop-blur">
            {phase.label}
          </StatusPill>
        </div>
        {/* transparency badge bottom */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
          <StatusPill status={tierTone} dot={false} className="bg-background/70 backdrop-blur">
            <ShieldCheck className="size-3.5" /> {tier} transparency
          </StatusPill>
          <span className="font-display text-sm font-bold text-foreground drop-shadow">{p.id}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-bold leading-tight text-balance">{p.name}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {p.district}, {p.state}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" /> {p.contractor}
              </span>
            </div>
          </div>
          <div className="relative grid shrink-0 place-items-center">
            <ProgressRing value={p.progress} size={56} stroke={5} tone={tone} />
            <span className="absolute text-center text-xs font-bold leading-none">
              <AnimatedNumber value={p.progress} suffix="%" />
            </span>
          </div>
        </div>

        {/* Budget grid */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {budgetRows.map((r) => (
            <div key={r.l} className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{r.l}</div>
              <div className="font-display text-sm font-bold">{formatCrore(r.v)}</div>
            </div>
          ))}
        </div>

        {/* Utilization bar */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Fund utilization</span>
            <span className="font-semibold">{utilPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent-teal transition-[width] duration-700"
              style={{ width: `${utilPct}%` }}
            />
          </div>
        </div>

        {/* Construction stage + completion date */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <HardHat className="size-3.5 text-primary" />
            <span className="font-medium text-foreground">{p.stage}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <CalendarClock className="size-3.5" /> Due {p.expectedCompletion}
          </span>
        </div>

        {/* Status badges */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <StatusPill status={tone} dot={false}>
            <BadgeCheck className="size-3.5" />
            {p.status === "verified" ? "AI verified" : p.status === "pending" ? "AI verifying" : "AI flagged"}
          </StatusPill>
          <StatusPill status={quality.tone} dot={false}>
            {quality.label}
          </StatusPill>
          <StatusPill status={funding.tone} dot={false}>
            <Wallet className="size-3.5" /> {funding.label}
          </StatusPill>
          <StatusPill status={riskTone} dot={false}>
            <AlertTriangle className="size-3.5" /> {riskLabel}
          </StatusPill>
        </div>

        {/* Quick summary */}
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span>{projectSummary(p)}</span>
        </p>

        {/* Expandable preview */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-3 inline-flex items-center gap-1 self-start text-xs font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {open ? "Hide preview" : "Quick preview"}
          <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="mt-3 grid gap-3 rounded-xl border border-border bg-muted/20 p-3 sm:grid-cols-2">
            <MiniMap id={p.id} tone={tone} />
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="text-right font-medium">{p.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Milestones</span>
                <span className="font-medium">
                  {p.milestonesDone}/{p.milestones} complete
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started</span>
                <span className="font-medium">{p.started}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Latest event</span>
                <span className="text-right font-medium">{p.lastEvent}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <Link
            href={`/workspace?project=${p.id}`}
            onClick={ripple.add}
            className="relative inline-flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Open workspace <ArrowUpRight className="size-4" />
            {ripple.layer}
          </Link>
          <Link
            href="/explorer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/40"
          >
            <ShieldCheck className="size-4" /> Transparency
          </Link>
          <IconToggle active={fav} onClick={() => setFav((v) => !v)} label="Favorite project">
            <Star className={cn("size-4", fav && "fill-current")} />
          </IconToggle>
          <IconToggle active={marked} onClick={() => setMarked((v) => !v)} label="Bookmark project">
            <Bookmark className={cn("size-4", marked && "fill-current")} />
          </IconToggle>
          <div className="relative" ref={menuRef}>
            <IconToggle active={menu} onClick={() => setMenu((v) => !v)} label="More actions">
              <MoreHorizontal className="size-4" />
            </IconToggle>
            {menu && (
              <div
                className="absolute bottom-full right-0 z-20 mb-2 w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl"
                role="menu"
              >
                {[
                  { label: "View reports", icon: ScrollText, href: "/reports" },
                  { label: "Citizen view", icon: Users, href: "/citizen" },
                  { label: "Share project", icon: Share2, href: "/projects" },
                ].map((m) => (
                  <Link
                    key={m.label}
                    href={m.href}
                    role="menuitem"
                    onClick={() => setMenu(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <m.icon className="size-4 text-muted-foreground" /> {m.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
