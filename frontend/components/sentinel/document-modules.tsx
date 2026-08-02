"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  FileSignature,
  Table2,
  ReceiptText,
  ClipboardList,
  Images as ImagesIcon,
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ScanLine,
  Lock,
  History,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertTriangle,
  Clock,
  Camera,
  FileClock,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { StatusPill } from "@/components/sentinel/primitives"
import { type SentinelProject } from "@/lib/sentinel-data"
import { cn } from "@/lib/utils"

/* ----------------------------------------------------------------
   Types + module catalogue (frontend only, no APIs / mock JSON)
-----------------------------------------------------------------*/

type DocState = "verified" | "review" | "flagged"
type DocExt = "pdf" | "xlsx" | "jpg"

type DocVersion = {
  version: string
  date: string
  note: string
  by: string
}

type ModuleDoc = {
  id: string
  name: string
  ext: DocExt
  size: string
  date: string
  state: DocState
  confidence: number
  pages: number
  versions: DocVersion[]
  image?: string
}

type ModuleKey = "tender" | "boq" | "invoices" | "progress" | "images"

type ModuleDef = {
  key: ModuleKey
  label: string
  Icon: LucideIcon
  ext: DocExt
  blurb: string
  accept: string
}

const MODULES: ModuleDef[] = [
  { key: "tender", label: "Tender", Icon: FileSignature, ext: "pdf", blurb: "Bid & award documents", accept: "PDF" },
  { key: "boq", label: "BOQ", Icon: Table2, ext: "xlsx", blurb: "Bill of quantities", accept: "XLSX · PDF" },
  { key: "invoices", label: "Invoices", Icon: ReceiptText, ext: "pdf", blurb: "Contractor billing", accept: "PDF" },
  { key: "progress", label: "Progress Reports", Icon: ClipboardList, ext: "pdf", blurb: "Milestone certificates", accept: "PDF" },
  { key: "images", label: "Images", Icon: ImagesIcon, ext: "jpg", blurb: "Geo-tagged site photos", accept: "JPG · PNG" },
]

const STATE_META: Record<DocState, { label: string; tone: "verified" | "pending" | "flagged"; Icon: LucideIcon }> = {
  verified: { label: "Verified", tone: "verified", Icon: ShieldCheck },
  review: { label: "Under review", tone: "pending", Icon: FileClock },
  flagged: { label: "Flagged", tone: "flagged", Icon: AlertTriangle },
}

/* ----------------------------------------------------------------
   Deterministic per-project seed documents for each module
-----------------------------------------------------------------*/

function seedVersions(base: string, date: string): DocVersion[] {
  return [
    { version: "v3", date, note: "AI re-verified after evidence match", by: "Sentinel AI" },
    { version: "v2", date, note: "Revised after clerical correction", by: "Dept. clerk" },
    { version: "v1", date, note: "Original submission uploaded", by: base },
  ]
}

function buildModuleDocs(p: SentinelProject, key: ModuleKey): ModuleDoc[] {
  const flagged = p.status === "flagged"
  const pending = p.status === "pending"
  const stateFor = (i: number, riskIndex: number): DocState => {
    if (flagged && i === riskIndex) return "flagged"
    if (pending && i === riskIndex) return "review"
    return "verified"
  }
  const conf = (s: DocState, i: number) => (s === "flagged" ? 41 + i : s === "review" ? 68 + i : 91 + ((i * 2) % 7))

  const mk = (
    idx: number,
    name: string,
    ext: DocExt,
    size: string,
    date: string,
    pages: number,
    riskIndex = 99,
    image?: string,
  ): ModuleDoc => {
    const state = stateFor(idx, riskIndex)
    return {
      id: `${key}-${idx}`,
      name,
      ext,
      size,
      date,
      pages,
      state,
      confidence: Math.min(99, conf(state, idx)),
      versions: seedVersions(p.contractor, date),
      image,
    }
  }

  switch (key) {
    case "tender":
      return [
        mk(0, "Tender Notice & Scope of Work", "pdf", "3.2 MB", p.started, 22),
        mk(1, "Technical Bid Evaluation", "pdf", "5.6 MB", p.started, 41),
        mk(2, "Award Agreement — Signed", "pdf", "4.1 MB", p.started, 34),
      ]
    case "boq":
      return [
        mk(0, "Master Bill of Quantities", "xlsx", "1.4 MB", p.started, 12),
        mk(1, "Rate Analysis Schedule", "xlsx", "0.9 MB", "Q2 2024", 8, 1),
        mk(2, "Revised BOQ — Variation 2", "pdf", "2.1 MB", "Q4 2024", 16),
      ]
    case "invoices":
      return [
        mk(0, "Contractor Invoice Batch #1", "pdf", "0.8 MB", "Q3 2023", 6),
        mk(1, "Contractor Invoice Batch #2", "pdf", "0.7 MB", "Q1 2024", 5),
        mk(2, "Contractor Invoice Batch #3", "pdf", "0.9 MB", "Q3 2024", 7, 2),
        mk(3, "Contractor Invoice Batch #4", "pdf", "1.1 MB", "Q1 2025", 8, 3),
      ]
    case "progress":
      return [
        mk(0, "Milestone 1 Progress Certificate", "pdf", "1.6 MB", "Q4 2023", 14),
        mk(1, "Milestone 3 Progress Certificate", "pdf", "1.8 MB", "Q3 2024", 18),
        mk(2, "Independent Quality Audit", "pdf", "4.7 MB", "Q2 2025", 26, 2),
      ]
    case "images":
      return [
        mk(0, "Site Overview — North Reach", "jpg", "6.4 MB", "Q1 2025", 1, 99, p.image),
        mk(1, "Structural Progress — Span 4", "jpg", "5.1 MB", "Q1 2025", 1, 99, p.image),
        mk(2, "Material Staging Yard", "jpg", "4.8 MB", "Q4 2024", 1, 99, p.image),
        mk(3, "Drone Aerial Survey Frame", "jpg", "8.2 MB", "Q1 2025", 1, 99, p.image),
      ]
  }
}

/* ----------------------------------------------------------------
   Small shared card
-----------------------------------------------------------------*/

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>{children}</div>
}

function ExtBadge({ ext }: { ext: DocExt }) {
  const label = ext.toUpperCase()
  const tone = ext === "xlsx" ? "verified" : ext === "jpg" ? "primary" : "flagged"
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        `bg-${tone}/12 text-${tone}`,
      )}
    >
      {label}
    </span>
  )
}

/* ----------------------------------------------------------------
   Upload state machine (simulated, client-only)
-----------------------------------------------------------------*/

type UploadState = {
  name: string
  ext: DocExt
  progress: number
  stage: number
}

const UPLOAD_STAGES = ["Uploading", "Encrypting", "AI parsing (OCR)", "Cross-verifying", "Verified"]

/* ----------------------------------------------------------------
   Main panel
-----------------------------------------------------------------*/

export function DocumentModulesPanel({ project }: { project: SentinelProject }) {
  const initial = useMemo(() => {
    const map = {} as Record<ModuleKey, ModuleDoc[]>
    for (const m of MODULES) map[m.key] = buildModuleDocs(project, m.key)
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id])

  const [docsByModule, setDocsByModule] = useState<Record<ModuleKey, ModuleDoc[]>>(initial)
  const [moduleKey, setModuleKey] = useState<ModuleKey>("tender")
  const [selectedId, setSelectedId] = useState<string>(initial.tender[0].id)
  const [dragging, setDragging] = useState(false)
  const [upload, setUpload] = useState<UploadState | null>(null)

  const intervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Reset when project changes
  useEffect(() => {
    setDocsByModule(initial)
    setModuleKey("tender")
    setSelectedId(initial.tender[0].id)
    setUpload(null)
  }, [initial])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const activeModule = MODULES.find((m) => m.key === moduleKey)!
  const docs = docsByModule[moduleKey]
  const selected = docs.find((d) => d.id === selectedId) ?? docs[0]

  function selectModule(key: ModuleKey) {
    setModuleKey(key)
    setSelectedId(docsByModule[key][0].id)
  }

  function startUpload(fileName?: string) {
    if (upload) return
    const ext = activeModule.ext
    const name =
      fileName ??
      `${activeModule.label} document ${String(docsByModule[moduleKey].length + 1).padStart(2, "0")}.${ext}`
    setUpload({ name, ext, progress: 0, stage: 0 })

    intervalRef.current = window.setInterval(() => {
      setUpload((prev) => {
        if (!prev) return prev
        const next = Math.min(100, prev.progress + Math.random() * 9 + 5)
        const stage = Math.min(UPLOAD_STAGES.length - 1, Math.floor(next / 20))
        if (next >= 100) {
          if (intervalRef.current) window.clearInterval(intervalRef.current)
          finalizeUpload(name, ext)
          return { ...prev, progress: 100, stage: UPLOAD_STAGES.length - 1 }
        }
        return { ...prev, progress: next, stage }
      })
    }, 110)
  }

  function finalizeUpload(name: string, ext: DocExt) {
    timeoutRef.current = window.setTimeout(() => {
      const today = "just now"
      const newDoc: ModuleDoc = {
        id: `${moduleKey}-new-${Date.now()}`,
        name,
        ext,
        size: `${(Math.random() * 4 + 1).toFixed(1)} MB`,
        date: today,
        state: "verified",
        confidence: Math.floor(Math.random() * 7) + 92,
        pages: ext === "jpg" ? 1 : Math.floor(Math.random() * 20) + 6,
        image: ext === "jpg" ? project.image : undefined,
        versions: [
          { version: "v1", date: today, note: "Uploaded & auto-verified by Sentinel AI", by: "You" },
        ],
      }
      setDocsByModule((prev) => ({ ...prev, [moduleKey]: [newDoc, ...prev[moduleKey]] }))
      setSelectedId(newDoc.id)
      setUpload(null)
    }, 650)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    startUpload(f?.name)
  }

  const verifiedCount = (list: ModuleDoc[]) => list.filter((d) => d.state === "verified").length

  return (
    <div className="space-y-5">
      {/* ---------- Module rail ---------- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {MODULES.map((m) => {
          const list = docsByModule[m.key]
          const active = m.key === moduleKey
          const attention = list.some((d) => d.state === "flagged")
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => selectModule(m.key)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
                active
                  ? "border-primary/60 bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30 hover:bg-muted/40",
              )}
            >
              {active && <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" />}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-xl transition-colors",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70",
                  )}
                >
                  <m.Icon className="size-5" />
                </span>
                {attention ? (
                  <span className="flex size-2.5 items-center">
                    <span className="size-2 rounded-full bg-flagged animate-pulse-dot" />
                  </span>
                ) : (
                  <CheckCircle2 className="size-4 text-verified" />
                )}
              </div>
              <div className="mt-3 font-display text-sm font-bold">{m.label}</div>
              <div className="text-[11px] text-muted-foreground">{m.blurb}</div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <span className="text-foreground/80">{list.length}</span> files ·
                <span className="text-verified">{verifiedCount(list)} verified</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* ---------- Body: upload + recent  |  preview + versions ---------- */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        {/* LEFT column */}
        <div className="space-y-5">
          {/* Upload area */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div className="flex items-center gap-2">
                <activeModule.Icon className="size-4 text-primary" />
                <h3 className="font-display text-sm font-bold">Upload to {activeModule.label}</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">Accepts {activeModule.accept}</span>
            </div>

            <div className="p-5">
              <input
                ref={fileRef}
                type="file"
                className="sr-only"
                onChange={(e) => startUpload(e.target.files?.[0]?.name)}
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  if (!upload) setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => !upload && fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !upload) {
                    e.preventDefault()
                    fileRef.current?.click()
                  }
                }}
                className={cn(
                  "relative flex min-h-[190px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-6 text-center transition-all grid-blueprint-sm",
                  dragging
                    ? "border-primary bg-primary/10 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-muted/40",
                )}
              >
                {upload ? (
                  /* ----- Animated upload progress ----- */
                  <div className="w-full max-w-xs">
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/25 to-transparent"
                      style={{ animation: "sentinel-scan 2.4s ease-in-out infinite" }}
                    />
                    <div className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10">
                      {upload.progress >= 100 ? (
                        <ShieldCheck className="size-7 text-verified" />
                      ) : (
                        <Loader2 className="size-7 animate-spin text-primary" />
                      )}
                    </div>
                    <div className="mt-3 truncate text-sm font-semibold">{upload.name}</div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-200",
                          upload.progress >= 100 ? "bg-verified" : "bg-primary",
                        )}
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-medium">
                      <span className="inline-flex items-center gap-1.5 text-primary">
                        {upload.stage >= UPLOAD_STAGES.length - 1 ? (
                          <ScanLine className="size-3.5" />
                        ) : (
                          <Sparkles className="size-3.5" />
                        )}
                        {UPLOAD_STAGES[upload.stage]}
                      </span>
                      <span className="text-muted-foreground">{Math.round(upload.progress)}%</span>
                    </div>
                  </div>
                ) : (
                  /* ----- Idle drop zone ----- */
                  <>
                    <span
                      className={cn(
                        "grid size-14 place-items-center rounded-2xl transition-transform",
                        dragging ? "scale-110 bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
                      )}
                    >
                      <UploadCloud className="size-7" />
                    </span>
                    <div className="mt-3 text-sm font-semibold text-balance">
                      {dragging ? "Release to upload" : "Drag & drop or browse"}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground text-balance">
                      Files are encrypted and auto-verified by Sentinel AI on upload.
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium">
                      <Lock className="size-3.5 text-muted-foreground" /> End-to-end encrypted
                    </span>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Recent uploads */}
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Recent uploads
              </h3>
              <span className="text-xs text-muted-foreground">{docs.length} in {activeModule.label}</span>
            </div>
            <ul className="mt-4 space-y-2">
              {docs.map((d) => {
                const meta = STATE_META[d.state]
                const isActive = d.id === selected.id
                const isNew = d.date === "just now"
                return (
                  <li key={d.id} className={isNew ? "animate-rise" : undefined}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(d.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                        isActive
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-primary/30 hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg",
                          `bg-${meta.tone}/12 text-${meta.tone}`,
                        )}
                      >
                        {d.ext === "jpg" && d.image ? (
                          <img src={d.image || "/placeholder.svg"} alt="" className="size-full object-cover" />
                        ) : (
                          <meta.Icon className="size-5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold">{d.name}</span>
                          {isNew && (
                            <span className="rounded-full bg-primary/12 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary">
                              New
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <ExtBadge ext={d.ext} /> {d.size} · {d.date}
                        </span>
                      </span>
                      <StatusPill status={meta.tone} className="shrink-0">
                        {meta.label}
                      </StatusPill>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>

        {/* RIGHT column */}
        <div className="space-y-5">
          <DocPreview doc={selected} moduleLabel={activeModule.label} />
          <VersionHistory doc={selected} />
        </div>
      </div>

      {/* ---------- Document activity timeline ---------- */}
      <DocumentTimeline docs={docs} moduleLabel={activeModule.label} />
    </div>
  )
}

/* ----------------------------------------------------------------
   Document preview (PDF pages OR image viewer)
-----------------------------------------------------------------*/

function DocPreview({ doc, moduleLabel }: { doc: ModuleDoc; moduleLabel: string }) {
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), [doc.id])
  const meta = STATE_META[doc.state]
  const isImage = doc.ext === "jpg"

  return (
    <Card key={doc.id} className="animate-tab-in">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ExtBadge ext={doc.ext} />
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{moduleLabel} preview</span>
          </div>
          <h3 className="mt-1.5 truncate font-display text-base font-bold">{doc.name}</h3>
        </div>
        <StatusPill status={meta.tone} className="shrink-0">
          <meta.Icon className="size-3.5" /> {meta.label}
        </StatusPill>
      </div>

      {/* Viewer */}
      {isImage ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <div className="relative">
            <img
              src={doc.image || "/placeholder.svg"}
              alt={`Site photograph — ${doc.name}`}
              className="aspect-video w-full object-cover"
            />
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-background/80 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
              <Camera className="size-3.5 text-primary" /> Geo-tagged · verified timestamp
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mt-4 overflow-hidden rounded-xl border border-border bg-muted/40">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-primary/15 to-transparent"
            style={{ animation: "sentinel-scan 4s ease-in-out infinite" }}
          />
          {/* Simulated PDF page */}
          <div className="mx-auto my-5 aspect-[1/1.3] w-[74%] rounded-md bg-card p-5 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="grid size-7 place-items-center rounded bg-primary/10 text-primary">
                <FileText className="size-4" />
              </span>
              <div className="h-2.5 w-24 rounded bg-foreground/20" />
            </div>
            <div className="mt-4 space-y-2">
              {[92, 100, 84, 96, 70].map((w, i) => (
                <div key={i} className="h-2 rounded bg-foreground/10" style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-9 rounded bg-foreground/[0.07]" />
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {[100, 88, 94].map((w, i) => (
                <div key={i} className="h-2 rounded bg-foreground/10" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          {/* Page controls */}
          <div className="flex items-center justify-center gap-3 border-t border-border bg-card/60 py-2.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="grid size-7 place-items-center rounded-lg border border-border transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs font-medium text-muted-foreground">
              Page {page} of {doc.pages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(doc.pages, p + 1))}
              className="grid size-7 place-items-center rounded-lg border border-border transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
              disabled={page >= doc.pages}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* AI confidence + download */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Sparkles className="size-4 text-primary" /> AI confidence
          </span>
          <span className="font-display font-bold">{doc.confidence}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all duration-700", `bg-${meta.tone}`)}
            style={{ width: `${doc.confidence}%` }}
          />
        </div>
        <button className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary">
          <Download className="size-4" /> Download original
        </button>
      </div>
    </Card>
  )
}

/* ----------------------------------------------------------------
   Version history (timeline design)
-----------------------------------------------------------------*/

function VersionHistory({ doc }: { doc: ModuleDoc }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <History className="size-4 text-muted-foreground" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Version history
        </h3>
      </div>
      <ol className="relative mt-4 ml-1 space-y-4 border-l border-border pl-5">
        {doc.versions.map((v, i) => {
          const current = i === 0
          return (
            <li key={`${doc.id}-${v.version}`} className="relative">
              <span
                className={cn(
                  "absolute -left-[26px] top-1 grid size-3.5 place-items-center rounded-full border-2",
                  current ? "border-primary bg-primary" : "border-border bg-card",
                )}
              >
                {current && <span className="absolute inset-0 rounded-full bg-primary/50 animate-pulse-dot" />}
              </span>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-bold", current ? "text-primary" : "text-foreground")}>
                  {v.version}
                </span>
                {current && (
                  <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                    Current
                  </span>
                )}
                <span className="ml-auto text-[11px] text-muted-foreground">{v.date}</span>
              </div>
              <p className="mt-0.5 text-xs text-foreground/75">{v.note}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">by {v.by}</p>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}

/* ----------------------------------------------------------------
   Document activity timeline (module-wide)
-----------------------------------------------------------------*/

function DocumentTimeline({ docs, moduleLabel }: { docs: ModuleDoc[]; moduleLabel: string }) {
  const events = docs.slice(0, 5).flatMap((d) => {
    const meta = STATE_META[d.state]
    return [
      {
        id: `${d.id}-e`,
        title:
          d.state === "flagged"
            ? `${d.name} flagged for review`
            : d.state === "review"
              ? `${d.name} awaiting verification`
              : `${d.name} verified by AI`,
        date: d.date,
        tone: meta.tone,
        Icon: meta.Icon,
      },
    ]
  })

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {moduleLabel} document timeline
        </h3>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <div key={e.id} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", `bg-${e.tone}/12 text-${e.tone}`)}>
              <e.Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{e.title}</div>
              <div className="text-[11px] text-muted-foreground">{e.date}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
