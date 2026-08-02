"use client"

import { useEffect, useRef, useState } from "react"
import {
  Road,
  Construction,
  School,
  Hospital,
  Droplets,
  Sun,
  TrainFront,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ---------- Reveal on scroll ---------- */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: React.ElementType
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      setShown(true)
      return
    }
    let io: IntersectionObserver | null = null
    const reveal = () => setShown(true)
    if (typeof IntersectionObserver === "undefined") {
      reveal()
      return
    }
    io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal()
          io?.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    const fallback = window.setTimeout(reveal, 600)
    return () => {
      io?.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
    >
      {children}
    </Tag>
  )
}

/* ---------- Kicker / section label ---------- */
export function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground",
        className,
      )}
    >
      <span className="h-px w-6 bg-primary/60" />
      {children}
    </span>
  )
}

/* ---------- Status pill ---------- */
const STATUS_STYLES: Record<string, string> = {
  verified: "bg-verified/12 text-verified border-verified/30",
  pending: "bg-pending/15 text-pending border-pending/40",
  flagged: "bg-flagged/12 text-flagged border-flagged/30",
  neutral: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/12 text-primary border-primary/30",
}

export function StatusPill({
  status = "neutral",
  children,
  dot = true,
  className,
}: {
  status?: keyof typeof STATUS_STYLES
  children: React.ReactNode
  dot?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

/* ---------- Animated number ---------- */
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    let raf = 0
    let io: IntersectionObserver | null = null
    const run = () => {
      const start = performance.now()
      const dur = 1400
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur)
        const eased = 1 - Math.pow(1 - p, 3)
        setDisplay(value * eased)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    if (!el || typeof IntersectionObserver === "undefined") {
      run()
      return
    }
    io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io?.disconnect()
        run()
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    const fallback = window.setTimeout(() => {
      io?.disconnect()
      run()
    }, 800)
    return () => {
      io?.disconnect()
      window.clearTimeout(fallback)
      cancelAnimationFrame(raf)
    }
  }, [value])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}

/* ---------- Progress ring ---------- */
export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  className,
  tone = "primary",
}: {
  value: number
  size?: number
  stroke?: number
  className?: string
  tone?: "primary" | "verified" | "pending" | "flagged"
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const toneVar =
    tone === "verified"
      ? "var(--verified)"
      : tone === "pending"
        ? "var(--pending)"
        : tone === "flagged"
          ? "var(--flagged)"
          : "var(--primary)"

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={toneVar}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (value / 100) * c}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
      />
    </svg>
  )
}

/* ---------- Category icon mapping ---------- */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  road: Road,
  bridge: Construction,
  school: School,
  hospital: Hospital,
  water: Droplets,
  solar: Sun,
  rail: TrainFront,
  shield: ShieldAlert,
}

export function CategoryIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = CATEGORY_ICONS[name] ?? School
  return <Icon className={className} />
}

/* ---------- Spark timeline (fund utilization) ---------- */
export function SparkTimeline({
  data,
  className,
}: {
  data: { q: string; sanctioned: number; verified: number }[]
  className?: string
}) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(...data.map((d) => d.sanctioned))

  return (
    <div className={cn("w-full", className)}>
      <div className="flex h-40 items-end gap-1.5 sm:gap-2">
        {data.map((d, i) => {
          const sH = (d.sanctioned / max) * 100
          const vH = (d.verified / max) * 100
          const isActive = active === i
          return (
            <div
              key={d.q}
              className="group relative flex flex-1 flex-col items-center justify-end"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {isActive && (
                <div className="absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
                  <div className="font-semibold">{d.q}</div>
                  <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                    <span className="size-2 rounded-full bg-primary" />
                    Sanctioned ₹{d.sanctioned.toLocaleString("en-IN")} Cr
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2 rounded-full bg-verified" />
                    Verified ₹{d.verified.toLocaleString("en-IN")} Cr
                  </div>
                </div>
              )}
              <div className="flex w-full max-w-[34px] items-end justify-center gap-0.5">
                <div
                  className="w-1/2 rounded-t-sm bg-primary/30 transition-all duration-300 group-hover:bg-primary/50"
                  style={{ height: `${sH}%` }}
                />
                <div
                  className="w-1/2 rounded-t-sm bg-verified/70 transition-all duration-300 group-hover:bg-verified"
                  style={{ height: `${vH}%` }}
                />
              </div>
              <span className="mt-2 text-[10px] font-medium text-muted-foreground">{d.q}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

