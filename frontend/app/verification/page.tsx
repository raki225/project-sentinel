"use client"

import { useEffect, useRef, useState } from "react"
import {
  ScanSearch,
  UploadCloud,
  Receipt,
  ImageIcon,
  Satellite,
  FileText,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Cpu,
} from "lucide-react"
import { Kicker, StatusPill } from "@/components/sentinel/primitives"
import { cn } from "@/lib/utils"

const INPUTS = [
  { icon: Receipt, label: "Invoice INV-2024-0412", meta: "PDF · 2.1 MB", ok: true },
  { icon: ImageIcon, label: "Geo-tagged site photos", meta: "48 images", ok: true },
  { icon: Satellite, label: "Satellite delta scan", meta: "Apr 2024", ok: true },
  { icon: FileText, label: "Milestone scope sheet", meta: "Sanction ref", ok: true },
]

const STEPS = [
  { label: "Ingesting evidence bundle", detail: "4 documents · 52 assets" },
  { label: "Cross-checking invoice against sanctioned scope", detail: "line-item reconciliation" },
  { label: "Matching field photos to project geo-polygon", detail: "GPS + EXIF validation" },
  { label: "Running satellite change detection", detail: "structural delta model" },
  { label: "Scanning for duplicate & inflated claims", detail: "anomaly graph" },
  { label: "Compiling integrity verdict", detail: "confidence aggregation" },
]

const CHECKS = [
  { label: "Invoice within sanctioned scope", score: 98, tone: "verified" },
  { label: "Field evidence geo-match", score: 99, tone: "verified" },
  { label: "Satellite structural progress", score: 96, tone: "verified" },
  { label: "Duplicate-claim scan", score: 92, tone: "verified" },
  { label: "Third-party sign-off present", score: 44, tone: "pending" },
]

const ANOMALIES = [
  { severity: "low", text: "Line item 7 priced 6% above regional benchmark — within tolerance." },
  { severity: "info", text: "Third-party quality report not yet attached to milestone 5." },
]

export default function VerificationPage() {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle")
  const [step, setStep] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const run = () => {
    setPhase("running")
    setStep(0)
    let s = 0
    timer.current = setInterval(() => {
      s++
      if (s >= STEPS.length) {
        if (timer.current) clearInterval(timer.current)
        setStep(STEPS.length)
        setTimeout(() => setPhase("done"), 500)
      } else {
        setStep(s)
      }
    }, 780)
  }

  const reset = () => {
    if (timer.current) clearInterval(timer.current)
    setPhase("idle")
    setStep(0)
  }

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current)
  }, [])

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Kicker>AI Verification Engine</Kicker>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-balance">Evidence, verified by machine</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Sentinel reconciles invoices, field photos and satellite imagery against the sanctioned scope — surfacing
            anomalies before a single rupee is released.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Cpu className="size-4" /> Sentinel-Vision v4
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left: inputs + dropzone */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide">Evidence bundle</h2>
            <div className="mt-4 space-y-2.5">
              {INPUTS.map((f) => (
                <div key={f.label} className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.meta}</p>
                  </div>
                  <CheckCircle2 className="size-4 text-verified" />
                </div>
              ))}
            </div>

            <div className="mt-4 grid place-items-center rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center transition-colors hover:border-primary/40">
              <UploadCloud className="size-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Drop additional evidence</p>
              <p className="text-xs text-muted-foreground">PDF, images, GIS or CSV up to 200 MB</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={run}
              disabled={phase === "running"}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {phase === "running" ? (
                <>
                  <ScanSearch className="size-4 animate-pulse" /> Analysing…
                </>
              ) : (
                <>
                  <Play className="size-4" /> Run verification
                </>
              )}
            </button>
            {phase !== "idle" && (
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:border-primary/40"
              >
                <RotateCcw className="size-4" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Right: analysis panel */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
          <div className="absolute inset-0 grid-blueprint-sm opacity-40" />
          {phase === "running" && (
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/25 to-transparent [animation:sentinel-scan_2.2s_linear_infinite]" />
          )}

          <div className="relative p-6">
            {phase === "idle" && (
              <div className="grid min-h-[420px] place-items-center text-center">
                <div>
                  <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <ScanSearch className="size-7" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold">Ready to verify</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                    Run the engine to reconcile this evidence bundle against the sanctioned project scope.
                  </p>
                </div>
              </div>
            )}

            {phase === "running" && (
              <div className="min-h-[420px]">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="size-4" /> Sentinel is analysing the bundle
                </div>
                <ol className="mt-6 space-y-3">
                  {STEPS.map((s, i) => {
                    const state = i < step ? "done" : i === step ? "active" : "todo"
                    return (
                      <li key={s.label} className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                            state === "done"
                              ? "border-verified bg-verified text-verified-foreground"
                              : state === "active"
                                ? "border-primary text-primary"
                                : "border-border text-muted-foreground",
                          )}
                        >
                          {state === "done" ? (
                            <CheckCircle2 className="size-3" />
                          ) : (
                            <span className={cn("size-1.5 rounded-full bg-current", state === "active" && "animate-pulse")} />
                          )}
                        </span>
                        <div>
                          <p className={cn("text-sm font-medium", state === "todo" && "text-muted-foreground")}>{s.label}</p>
                          <p className="text-xs text-muted-foreground">{s.detail}</p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}

            {phase === "done" && (
              <div className="min-h-[420px] animate-rise">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-xl bg-verified/15 text-verified">
                      <CheckCircle2 className="size-6" />
                    </span>
                    <div>
                      <div className="font-display text-lg font-bold">Verification passed</div>
                      <div className="text-sm text-muted-foreground">Milestone 5 evidence bundle</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-3xl font-bold text-verified">96%</div>
                    <div className="text-xs text-muted-foreground">confidence</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {CHECKS.map((c) => (
                    <div key={c.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{c.label}</span>
                        <span className={cn("font-semibold", c.tone === "pending" ? "text-pending" : "text-verified")}>
                          {c.score}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", c.tone === "pending" ? "bg-pending" : "bg-verified")}
                          style={{ width: `${c.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Anomalies detected</h4>
                  <div className="mt-3 space-y-2">
                    {ANOMALIES.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-3">
                        <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", a.severity === "low" ? "text-pending" : "text-muted-foreground")} />
                        <p className="text-sm text-muted-foreground">{a.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <StatusPill status="verified">Recommended: release next tranche</StatusPill>
                  <StatusPill status="pending" dot={false}>Requires human sign-off</StatusPill>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "Median analysis time", v: "3.2s" },
          { k: "Evidence types", v: "12" },
          { k: "Detection accuracy", v: "97.4%" },
          { k: "Human hours saved / mo", v: "18,400" },
        ].map((s) => (
          <div key={s.k} className="rounded-2xl border border-border bg-card p-5">
            <div className="font-display text-2xl font-bold">{s.v}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.k}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
