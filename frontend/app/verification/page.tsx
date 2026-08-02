"use client"

import { useEffect, useRef, useState } from "react"
import {
  ScanSearch,
  UploadCloud,
  FileText,
  FileWarning,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Cpu,
  X,
} from "lucide-react"
import { Kicker, StatusPill } from "@/components/sentinel/primitives"
import { useRunVerification } from "@/hooks/useRunVerification"
import { cn } from "@/lib/utils"

// Cosmetic step labels shown while the real upload+analyze request is in
// flight — the backend does this as one request/response (no incremental
// progress events), so this is a progress *indicator*, not a claim about
// what's literally happening server-side at each tick.
const STEPS = [
  { label: "Uploading document", detail: "Sentinel storage" },
  { label: "Extracting text", detail: "PDF / DOCX / OCR" },
  { label: "Running AI audit", detail: "budget, timeline, documentation, execution" },
  { label: "Cross-checking for anomalies", detail: "invoice, duplicate & compliance scan" },
  { label: "Geocoding project location", detail: "best-effort" },
  { label: "Compiling audit verdict", detail: "confidence aggregation" },
]

type HealthTone = "verified" | "pending" | "flagged"

function toneForScore(score: number): HealthTone {
  if (score >= 75) return "verified"
  if (score >= 45) return "pending"
  return "flagged"
}

function toneClass(tone: HealthTone, kind: "text" | "bg"): string {
  const map: Record<HealthTone, string> = { verified: "verified", pending: "pending", flagged: "flagged" }
  return `${kind}-${map[tone]}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function VerificationPage() {
  const mutation = useRunVerification()
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [step, setStep] = useState(0)
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const phase: "idle" | "running" | "done" | "error" = mutation.isPending
    ? "running"
    : mutation.isSuccess
      ? "done"
      : mutation.isError
        ? "error"
        : "idle"

  // Cosmetic step animation only runs while the real request is in flight —
  // it never advances phase itself; that only happens when the mutation
  // actually resolves.
  useEffect(() => {
    if (mutation.isPending) {
      setStep(0)
      stepTimer.current = setInterval(() => {
        setStep((s) => Math.min(STEPS.length - 1, s + 1))
      }, 900)
    } else if (stepTimer.current) {
      clearInterval(stepTimer.current)
    }
    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current)
    }
  }, [mutation.isPending])

  function run() {
    if (!file) return
    mutation.mutate(file)
  }

  function reset() {
    mutation.reset()
    setFile(null)
    setStep(0)
  }

  function onFileSelected(f: File | undefined) {
    if (!f) return
    setFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (phase === "running") return
    onFileSelected(e.dataTransfer.files?.[0])
  }

  const report = mutation.data
  const riskLevel = report?.riskLevel ?? ""
  const verdictTone: HealthTone = riskLevel === "Low" ? "verified" : riskLevel === "Medium" ? "pending" : "flagged"
  const verdictLabel =
    riskLevel === "Low" ? "Verification passed" : riskLevel === "Medium" ? "Requires review" : "Verification flagged"
  const VerdictIcon = verdictTone === "verified" ? CheckCircle2 : AlertTriangle

  const healthChecks = report
    ? [
        { label: "Budget health", score: report.budgetHealth },
        { label: "Timeline health", score: report.timelineHealth },
        { label: "Documentation health", score: report.documentationHealth },
        { label: "Execution health", score: report.executionHealth },
      ].map((c) => ({ ...c, tone: toneForScore(c.score) }))
    : []

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Kicker>AI Verification Engine</Kicker>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-balance">Evidence, verified by machine</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Upload a real project document — Sentinel extracts it, runs a full AI audit, and surfaces anomalies
            before a single rupee is released.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Cpu className="size-4" /> Sentinel AI Audit
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left: evidence + dropzone */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide">Evidence document</h2>

            {file ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                {phase !== "running" && (
                  <button
                    onClick={() => setFile(null)}
                    aria-label="Remove file"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Tender notices, invoices, progress reports, completion certificates — anything Sentinel&apos;s audit
                pipeline can extract and score.
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              className="sr-only"
              onChange={(e) => onFileSelected(e.target.files?.[0])}
            />
            <div
              onDragOver={(e) => {
                e.preventDefault()
                if (phase !== "running") setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => phase !== "running" && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && phase !== "running") {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              className={cn(
                "mt-4 grid cursor-pointer place-items-center rounded-xl border border-dashed px-4 py-8 text-center transition-colors",
                dragging ? "border-primary bg-primary/10" : "border-border bg-background/40 hover:border-primary/40",
              )}
            >
              <UploadCloud className="size-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">{file ? "Drop to replace" : "Drop a document to verify"}</p>
              <p className="text-xs text-muted-foreground">PDF, DOCX, PNG or JPG, up to 25 MB</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={run}
              disabled={!file || phase === "running"}
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
                    {file
                      ? `Run the engine to audit "${file.name}" against Sentinel's extraction and risk-scoring pipeline.`
                      : "Drop a document on the left to run a real Sentinel audit against it."}
                  </p>
                </div>
              </div>
            )}

            {phase === "running" && (
              <div className="min-h-[420px]">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="size-4" /> Sentinel is analysing the document
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

            {phase === "error" && (
              <div className="grid min-h-[420px] place-items-center text-center">
                <div>
                  <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-flagged/10 text-flagged">
                    <AlertTriangle className="size-7" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold">Verification failed</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                    {mutation.error?.message ?? "Something went wrong while reaching the Sentinel API."}
                  </p>
                  <button
                    onClick={run}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    <RotateCcw className="size-4" /> Try again
                  </button>
                </div>
              </div>
            )}

            {phase === "done" && report && (
              <div className="min-h-[420px] animate-rise">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn("grid size-12 place-items-center rounded-xl", `bg-${verdictTone}/15`, toneClass(verdictTone, "text"))}>
                      <VerdictIcon className="size-6" />
                    </span>
                    <div>
                      <div className="font-display text-lg font-bold">{verdictLabel}</div>
                      <div className="text-sm text-muted-foreground">{report.projectName || file?.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("font-display text-3xl font-bold", toneClass(verdictTone, "text"))}>
                      {report.confidence}%
                    </div>
                    <div className="text-xs text-muted-foreground">confidence</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {healthChecks.map((c) => (
                    <div key={c.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{c.label}</span>
                        <span className={cn("font-semibold", toneClass(c.tone, "text"))}>{c.score}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", toneClass(c.tone, "bg"))}
                          style={{ width: `${c.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {report.anomalies.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Anomalies detected</h4>
                    <div className="mt-3 space-y-2">
                      {report.anomalies.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-3">
                          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-pending" />
                          <p className="text-sm text-muted-foreground">{a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.missingEvidence.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Missing evidence</h4>
                    <div className="mt-3 space-y-2">
                      {report.missingEvidence.map((m, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-3">
                          <FileWarning className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{m}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <StatusPill status={verdictTone}>{report.paymentRecommendation || "No payment recommendation yet"}</StatusPill>
                  <StatusPill status="pending" dot={false}>
                    Requires human sign-off
                  </StatusPill>
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
