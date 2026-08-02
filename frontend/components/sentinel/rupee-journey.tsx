"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Landmark,
  Building2,
  Building,
  Briefcase,
  HardHat,
  Truck,
  Hammer,
  BadgeCheck,
  ZoomIn,
  ZoomOut,
  Locate,
  Play,
  Pause,
  X,
  FileCheck2,
  FileWarning,
  Sparkles,
  TrendingDown,
  MousePointerClick,
  Move,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCrore, type SentinelProject } from "@/lib/sentinel-data"
import { AnimatedNumber, ProgressRing, StatusPill } from "@/components/sentinel/primitives"

/* ================================================================
   Journey of Every Public Rupee — signature money-flow visualization
   Frontend only. All figures derived deterministically from the
   project's real sanctioned / released / utilized / integrity data.
================================================================ */

type StageStatus = "verified" | "pending" | "flagged"

type StageDef = {
  name: string
  sub: string
  Icon: LucideIcon
  evidence: string[]
}

const STAGE_DEFS: StageDef[] = [
  {
    name: "Government Treasury",
    sub: "Union budget allocation",
    Icon: Landmark,
    evidence: ["Sanction order (GO)", "Budget line reference", "Parliamentary allocation memo"],
  },
  {
    name: "State Government",
    sub: "State treasury transfer",
    Icon: Building2,
    evidence: ["State release order", "PFMS transfer receipt", "Treasury sanction note"],
  },
  {
    name: "District Authority",
    sub: "District-level disbursement",
    Icon: Building,
    evidence: ["District allocation letter", "DPR approval", "Fund apportionment sheet"],
  },
  {
    name: "Executing Agency",
    sub: "Implementation & PMU",
    Icon: Briefcase,
    evidence: ["Work order", "Agency MoU", "Utilization certificate (UC)"],
  },
  {
    name: "Contractor",
    sub: "Prime works contractor",
    Icon: HardHat,
    evidence: ["Contract agreement", "Running account bill (RA)", "Bank guarantee"],
  },
  {
    name: "Material Suppliers",
    sub: "Vendors & material supply",
    Icon: Truck,
    evidence: ["Purchase orders", "GST tax invoices", "Material test certificates", "Delivery challans"],
  },
  {
    name: "Construction Site",
    sub: "On-ground execution",
    Icon: Hammer,
    evidence: ["Site measurement book", "Geo-tagged photos", "Drone / satellite scan", "Third-party QA report"],
  },
  {
    name: "Completed Infrastructure",
    sub: "Field-verified public asset",
    Icon: BadgeCheck,
    evidence: ["Completion certificate", "Final utilization certificate", "Asset handover note", "Independent audit sign-off"],
  },
]

type Stage = StageDef & {
  index: number
  amount: number // crore reaching this stage
  status: StageStatus
  confidence: number
  available: string[]
  missing: string[]
  note: string
  x: number
  y: number
}

const CARD_W = 250
const CARD_H = 104
const WORLD_W = 720
// node top-left positions (serpentine)
const NODE_X = (i: number) => (i % 2 === 0 ? 70 : WORLD_W - 70 - CARD_W)
const NODE_Y = (i: number) => 40 + i * 170
const WORLD_H = NODE_Y(STAGE_DEFS.length - 1) + CARD_H + 60
const cx = (i: number) => NODE_X(i) + CARD_W / 2
const cy = (i: number) => NODE_Y(i) + CARD_H / 2

function makeSeed(id: string) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return () => {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0
    return h / 0xffffffff
  }
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

function buildJourney(project: SentinelProject): Stage[] {
  const rnd = makeSeed(project.id)
  const S = project.sanctioned
  const relR = clamp(project.released / S, 0.05, 1)
  const utR = clamp(project.utilized / S, 0.02, 1)
  const groundR = utR * (project.integrity / 100)

  const stageStatus = (k: number): StageStatus => {
    if (project.status === "flagged") {
      if (k === 4 || k === 5) return "flagged"
      if (k === 6) return "pending"
      return "verified"
    }
    if (project.status === "pending") {
      if (k === 3 || k === 4) return "pending"
      if (k === 7 && project.progress < 100) return "pending"
      return "verified"
    }
    if (k === 7 && project.progress < 100) return "pending"
    return "verified"
  }

  return STAGE_DEFS.map((def, k) => {
    // monotonic decreasing fraction of sanctioned reaching this stage
    let frac: number
    if (k === 0) frac = 1
    else if (k === 7) frac = groundR
    else {
      const t = (k - 1) / 5
      frac = relR + (utR - relR) * t
    }
    const amount = Math.round(S * frac)
    const status = stageStatus(k)

    // deterministic AI confidence
    const jitter = rnd()
    const confidence = Math.round(
      status === "flagged"
        ? 38 + jitter * 20
        : status === "pending"
          ? 66 + jitter * 16
          : clamp(project.integrity - 4 + jitter * 10, 74, 99),
    )

    // evidence available vs missing
    const total = def.evidence.length
    const availableCount = status === "verified" ? total : status === "pending" ? Math.max(1, total - 1) : Math.max(1, total - 2)
    const available = def.evidence.slice(0, availableCount)
    const missing = def.evidence.slice(availableCount)

    const note =
      status === "flagged"
        ? "AI flagged a mismatch between funds moved and verifiable documentation at this tier. Escalated for audit."
        : status === "pending"
          ? "Funds recorded at this tier; documentary evidence is still under AI cross-verification."
          : "Fund movement fully reconciled with on-file evidence and ledger entries."

    return {
      ...def,
      index: k,
      amount,
      status,
      confidence,
      available,
      missing,
      note,
      x: NODE_X(k),
      y: NODE_Y(k),
    }
  })
}

const TONE_CHIP: Record<StageStatus, string> = {
  verified: "bg-verified/12 text-verified border-verified/30",
  pending: "bg-pending/12 text-pending border-pending/30",
  flagged: "bg-flagged/12 text-flagged border-flagged/30",
}
const TONE_BAR: Record<StageStatus, string> = {
  verified: "bg-verified",
  pending: "bg-pending",
  flagged: "bg-flagged",
}
const TONE_VAR: Record<StageStatus, string> = {
  verified: "var(--verified)",
  pending: "var(--pending)",
  flagged: "var(--flagged)",
}
const STATUS_LABEL: Record<StageStatus, string> = {
  verified: "Verified",
  pending: "Under review",
  flagged: "Flagged",
}

export function RupeeJourneyPanel({ project }: { project: SentinelProject }) {
  const stages = useMemo(() => buildJourney(project), [project])
  const [selected, setSelected] = useState<number | null>(0)
  const [hover, setHover] = useState<number | null>(null)
  const [flowing, setFlowing] = useState(true)

  const viewportRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState({ scale: 0.8, tx: 0, ty: 20 })

  const drag = useRef({ active: false, moved: false, x: 0, y: 0 })

  const fitView = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const cw = el.clientWidth
    const scale = clamp((cw - 48) / WORLD_W, 0.5, 1.05)
    setView({ scale, tx: (cw - WORLD_W * scale) / 2, ty: 20 })
  }, [])

  useEffect(() => {
    fitView()
  }, [fitView])

  // reset selection + view when project changes
  useEffect(() => {
    setSelected(0)
    fitView()
  }, [project.id, fitView])

  // non-passive wheel zoom toward cursor
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      setView((v) => {
        const factor = e.deltaY < 0 ? 1.12 : 0.89
        const ns = clamp(v.scale * factor, 0.42, 1.9)
        const ratio = ns / v.scale
        return { scale: ns, tx: mx - (mx - v.tx) * ratio, ty: my - (my - v.ty) * ratio }
      })
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, moved: false, x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.current.moved = true
    drag.current.x = e.clientX
    drag.current.y = e.clientY
    setView((v) => ({ ...v, tx: v.tx + dx, ty: v.ty + dy }))
  }
  const onPointerUp = (e: React.PointerEvent) => {
    drag.current.active = false
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
  }

  const zoomBy = (factor: number) => {
    const el = viewportRef.current
    if (!el) return
    const mx = el.clientWidth / 2
    const my = el.clientHeight / 2
    setView((v) => {
      const ns = clamp(v.scale * factor, 0.42, 1.9)
      const ratio = ns / v.scale
      return { scale: ns, tx: mx - (mx - v.tx) * ratio, ty: my - (my - v.ty) * ratio }
    })
  }

  const selectStage = (k: number) => {
    if (drag.current.moved) return
    setSelected((cur) => (cur === k ? null : k))
  }

  // connectors
  const connectors = useMemo(() => {
    return stages.slice(0, -1).map((s, i) => {
      const x1 = cx(i)
      const y1 = NODE_Y(i) + CARD_H
      const x2 = cx(i + 1)
      const y2 = NODE_Y(i + 1)
      const d = `M ${x1} ${y1} C ${x1} ${y1 + 80}, ${x2} ${y2 - 80}, ${x2} ${y2}`
      const next = stages[i + 1]
      return {
        id: `conn-${project.id}-${i}`,
        d,
        midX: (x1 + x2) / 2,
        midY: (y1 + y2) / 2,
        amount: next.amount,
        status: next.status,
        leak: s.amount - next.amount,
      }
    })
  }, [stages, project.id])

  // summary metrics
  const reachedPct = Math.round((stages[7].amount / stages[0].amount) * 100)
  const releasedPct = Math.round((stages[1].amount / stages[0].amount) * 100)
  const avgConfidence = Math.round(stages.reduce((a, s) => a + s.confidence, 0) / stages.length)

  const active = selected != null ? stages[selected] : null

  return (
    <div className="space-y-4 animate-tab-in">
      {/* Signature header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div
          className="absolute -right-24 -top-24 size-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              Signature transparency view
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              Journey of Every Public Rupee
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
              Follow a single sanctioned rupee from the national treasury down to the completed public asset — each
              hand-off verified, evidenced, and scored by AI.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
            <HeaderStat label="Sanctioned" value={<AnimatedNumber value={stages[0].amount} prefix="₹" suffix=" Cr" />} />
            <HeaderStat label="Released" value={`${releasedPct}%`} tone="primary" />
            <HeaderStat label="Verified on ground" value={`${reachedPct}%`} tone={reachedPct >= 70 ? "verified" : "flagged"} />
            <HeaderStat label="Avg AI confidence" value={`${avgConfidence}%`} tone={avgConfidence >= 80 ? "verified" : "pending"} />
          </div>
        </div>
      </div>

      {/* Interactive canvas + detail */}
      <div className="relative">
        <div
          ref={viewportRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="relative h-[560px] w-full cursor-grab touch-none overflow-hidden rounded-2xl border border-border bg-muted/20 active:cursor-grabbing"
        >
          <div className="grid-blueprint-sm absolute inset-0 opacity-60" aria-hidden />

          {/* transformed world */}
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: WORLD_W,
              height: WORLD_H,
              transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
            }}
          >
            {/* connectors + money particles */}
            <svg
              width={WORLD_W}
              height={WORLD_H}
              viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
              className="absolute inset-0"
              style={{ pointerEvents: "none" }}
            >
              <defs>
                {connectors.map((c) => (
                  <path key={`def-${c.id}`} id={c.id} d={c.d} />
                ))}
              </defs>
              {connectors.map((c, i) => {
                const stroke = TONE_VAR[c.status]
                const isPath = hover === i || hover === i + 1 || selected === i || selected === i + 1
                return (
                  <g key={c.id}>
                    {/* glow */}
                    <use href={`#${c.id}`} fill="none" stroke={stroke} strokeWidth={isPath ? 10 : 7} opacity={0.14} />
                    {/* base */}
                    <use
                      href={`#${c.id}`}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={2.25}
                      opacity={isPath ? 0.9 : 0.5}
                      strokeLinecap="round"
                      strokeDasharray="1 9"
                    />
                    {/* flowing money particles */}
                    {flowing &&
                      [0, 0.7, 1.4].map((begin, p) => (
                        <circle key={p} r={p === 1 ? 4 : 3} fill={stroke}>
                          <animateMotion dur="2.1s" begin={`${begin}s`} repeatCount="indefinite" rotate="auto">
                            <mpath href={`#${c.id}`} />
                          </animateMotion>
                          <animate
                            attributeName="opacity"
                            values="0;1;1;0"
                            keyTimes="0;0.15;0.85;1"
                            dur="2.1s"
                            begin={`${begin}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      ))}
                    {/* amount label */}
                    <g transform={`translate(${c.midX}, ${c.midY})`}>
                      <rect x={-46} y={-11} width={92} height={22} rx={11} fill="var(--card)" stroke="var(--border)" />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={700}
                        fill="var(--foreground)"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {formatCrore(c.amount)}
                      </text>
                    </g>
                  </g>
                )
              })}
            </svg>

            {/* stage nodes */}
            {stages.map((s) => {
              const isSel = selected === s.index
              const isHov = hover === s.index
              return (
                <button
                  key={s.index}
                  type="button"
                  onMouseEnter={() => setHover(s.index)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => selectStage(s.index)}
                  style={{
                    left: s.x,
                    top: s.y,
                    width: CARD_W,
                    height: CARD_H,
                    animationDelay: `${s.index * 70}ms`,
                  }}
                  className={cn(
                    "animate-rise absolute flex flex-col justify-between rounded-xl border bg-card p-3 text-left transition-all duration-300",
                    isSel
                      ? "border-primary shadow-lg ring-2 ring-primary/40"
                      : isHov
                        ? "-translate-y-0.5 border-primary/40 shadow-md"
                        : "border-border shadow-sm",
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg border", TONE_CHIP[s.status])}>
                      <s.Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                          {String(s.index + 1).padStart(2, "0")}
                        </span>
                        <span className={cn("size-1.5 rounded-full", TONE_BAR[s.status])} />
                      </div>
                      <div className="truncate font-display text-sm font-bold leading-tight">{s.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{s.sub}</div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="font-display text-base font-bold">{formatCrore(s.amount)}</div>
                    <span className={cn("text-[10px] font-semibold", `text-${s.status}`)}>{STATUS_LABEL[s.status]}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* floating controls */}
          <div className="absolute right-3 top-3 flex flex-col gap-1.5">
            <CanvasBtn onClick={() => zoomBy(1.2)} label="Zoom in">
              <ZoomIn className="size-4" />
            </CanvasBtn>
            <CanvasBtn onClick={() => zoomBy(0.83)} label="Zoom out">
              <ZoomOut className="size-4" />
            </CanvasBtn>
            <CanvasBtn onClick={fitView} label="Reset view">
              <Locate className="size-4" />
            </CanvasBtn>
            <CanvasBtn onClick={() => setFlowing((f) => !f)} label={flowing ? "Pause flow" : "Play flow"} active={flowing}>
              {flowing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </CanvasBtn>
          </div>

          {/* hint */}
          <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background/80 px-3 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur">
            <span className="flex items-center gap-1.5">
              <MousePointerClick className="size-3.5" /> Click a stage
            </span>
            <span className="flex items-center gap-1.5">
              <Move className="size-3.5" /> Drag to pan
            </span>
            <span className="flex items-center gap-1.5">
              <ZoomIn className="size-3.5" /> Scroll to zoom
            </span>
          </div>

          {/* legend */}
          <div className="pointer-events-none absolute bottom-3 right-3 hidden gap-3 rounded-lg border border-border bg-background/80 px-3 py-1.5 text-[10px] font-medium backdrop-blur sm:flex">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-verified" /> Verified
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-pending" /> Review
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-flagged" /> Flagged
            </span>
          </div>

          {/* detail panel */}
          {active && (
            <div
              key={active.index}
              className="animate-rise absolute inset-x-3 bottom-3 z-30 max-h-[72%] overflow-y-auto rounded-xl border border-border bg-popover/95 p-4 shadow-xl backdrop-blur md:inset-y-3 md:bottom-auto md:left-auto md:right-3 md:top-3 md:max-h-none md:w-[330px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className={cn("grid size-10 place-items-center rounded-lg border", TONE_CHIP[active.status])}>
                    <active.Icon className="size-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                        STAGE {String(active.index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="font-display text-base font-bold leading-tight">{active.name}</div>
                    <div className="text-[11px] text-muted-foreground">{active.sub}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="grid size-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted"
                  aria-label="Close details"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {active.index === 0 ? "Sanctioned" : "Funds received"}
                  </div>
                  <div className="font-display text-xl font-bold">{formatCrore(active.amount)}</div>
                </div>
                <StatusPill status={active.status}>{STATUS_LABEL[active.status]}</StatusPill>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniStat
                  label={active.index === STAGE_DEFS.length - 1 ? "Verified on ground" : "Passed onward"}
                  value={
                    active.index === STAGE_DEFS.length - 1
                      ? formatCrore(active.amount)
                      : formatCrore(stages[active.index + 1]?.amount ?? active.amount)
                  }
                />
                <MiniStat
                  label="Leakage to next"
                  value={
                    active.index === STAGE_DEFS.length - 1
                      ? "—"
                      : formatCrore(Math.max(0, active.amount - (stages[active.index + 1]?.amount ?? active.amount)))
                  }
                  Icon={TrendingDown}
                  tone="flagged"
                />
              </div>

              {/* AI confidence */}
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="relative grid place-items-center">
                  <ProgressRing
                    value={active.confidence}
                    size={56}
                    stroke={6}
                    tone={active.status === "flagged" ? "flagged" : active.status === "pending" ? "pending" : "verified"}
                  />
                  <span className="absolute font-display text-xs font-bold">{active.confidence}%</span>
                </div>
                <div>
                  <div className="text-xs font-semibold">AI verification confidence</div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{active.note}</p>
                </div>
              </div>

              {/* evidence */}
              <div className="mt-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Evidence on file ({active.available.length})
                </div>
                <ul className="mt-2 space-y-1.5">
                  {active.available.map((e) => (
                    <li key={e} className="flex items-center gap-2 text-xs">
                      <FileCheck2 className="size-3.5 shrink-0 text-verified" />
                      <span className="text-foreground/90">{e}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* missing */}
              <div className="mt-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Missing documents ({active.missing.length})
                </div>
                {active.missing.length === 0 ? (
                  <div className="mt-2 flex items-center gap-2 rounded-md border border-verified/30 bg-verified/10 px-2.5 py-2 text-xs text-verified">
                    <FileCheck2 className="size-3.5" /> Complete — nothing outstanding
                  </div>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {active.missing.map((e) => (
                      <li key={e} className="flex items-center gap-2 text-xs">
                        <FileWarning className="size-3.5 shrink-0 text-flagged" />
                        <span className="text-muted-foreground">{e}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------- small pieces ---------------- */

function HeaderStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: React.ReactNode
  tone?: "neutral" | "primary" | "verified" | "pending" | "flagged"
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 px-3 py-2.5 backdrop-blur">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-display text-lg font-bold", tone !== "neutral" && `text-${tone}`)}>{value}</div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  Icon,
  tone,
}: {
  label: string
  value: React.ReactNode
  Icon?: LucideIcon
  tone?: "flagged"
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className={cn("size-3", tone === "flagged" && "text-flagged")} />}
        {label}
      </div>
      <div className="mt-0.5 font-display text-sm font-bold">{value}</div>
    </div>
  )
}

function CanvasBtn({
  onClick,
  label,
  children,
  active,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-9 place-items-center rounded-lg border bg-background/85 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted",
        active ? "border-primary/50 text-primary" : "border-border",
      )}
    >
      {children}
    </button>
  )
}
