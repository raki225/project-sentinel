# Project Sentinel — Backend V2 Architecture

**Status:** Design only. Nothing in this document has been implemented. No frontend or backend code has been changed as part of this pass.

**Mandate this document satisfies:** the frontend (`frontend/`) is the source of truth for product surface. This document designs a backend that can serve 100% of what the frontend currently renders, using real project data (seeded from public government sources) enriched by AI-verified uploaded evidence — not synthetic demo data. The existing `Backend/` is treated as a component inventory to reuse, not a contract to preserve.

---

## 1. Frontend inventory (complete)

Every route, every interactive element, and every piece of data it consumes. This is the spec the backend must satisfy.

### 1.1 Global shell

| Component | Elements | Data dependency |
|---|---|---|
| `site-header.tsx` | 8-link nav (Overview/Projects/Workspace/AI Verification/Explorer/Citizen View/Reports/Sentinel), theme toggle, mobile menu, "Live ledger synced" indicator | None (static) — the "synced" indicator is currently decorative; V2 should back it with a real last-sync timestamp |
| `site-footer.tsx` | Static link columns | None |
| `project-map.tsx` (**already live**) | Leaflet map, risk-colored pins, popup → report link, retry button | `GET /api/projects/map` |
| `live-activity-feed.tsx` (**already live**) | Polls every 10s, renders audit events | `GET /api/activity/live?limit=8` |

### 1.2 `/` — Overview (command center)

- Live clock (client-only, no data)
- Hero transparency score, 3-way verified/review/flagged split, "1,284 active projects" copy
- 4 summary tiles: funds tracked, projects monitored, AI verifications run, irregularities flagged
- **Live monitoring map** (existing) + **AI activity feed** (existing)
- 8 infrastructure category tiles: name, project count, sanctioned total, verified %
- Project search + status filter + category chips + result grid (9 cards) → links to `/workspace`
- "Awaiting verification" list (4 pending projects) + "Recently verified" list (3 projects)
- Fund utilization sparkline (10 quarters: sanctioned vs. verified) + state-wise verified-spend bars (8 states)
- "Open integrity flags" grid (flagged projects)

**Every number above is currently hardcoded** in `lib/sentinel-data.ts`. All of it must come from the backend in V2: project counts/totals, category rollups, quarterly fund timeline, state rollups, and the flagged/pending/verified project lists.

### 1.3 `/projects` — Project registry

- Search (name/district/state/contractor/id), category chips (8), phase filter (5), transparency-tier filter (3), min-budget slider, min-completion slider, sort (6 options), grid/list toggle, "Clear filters", empty state
- Renders `ProjectCard` for every match

**Data dependency:** a filterable, sortable, paginated project listing endpoint covering every field above.

### 1.4 `ProjectCard` (used on Overview, Projects, Citizen)

Buttons/interactions: expandable "Quick preview" (mini-map + department/milestones/started/last-event), Favorite (star), Bookmark, "More actions" menu (View reports / Citizen view / Share), "Open workspace" link, "Transparency" link.

**Data dependency:** full project record (budget breakdown, phase, integrity, milestones done/total, contractor, stage, image, last event) + a per-project mini-map point (lat/lng).

### 1.5 `/workspace` — Per-project workspace

Project switcher (all projects), header stat strip (budget/completion/phase/AI status), integrity ring. Six tabs, each a full sub-application:

| Tab | Interactions | Data dependency |
|---|---|---|
| **Overview** | Clickable milestone timeline (select any milestone → detail panel), verification-signal checklist, funds-at-a-glance | Milestones (ordered, with phase/date/detail/funds-linked), verification signal booleans, idle-funds calc |
| **Documents** | 5 module tabs (Tender/BOQ/Invoices/Progress Reports/Images), **file upload** (drag-drop or click, per-module accept types), document list, document preview (PDF pager or image viewer), version history, per-module activity timeline | Per-module document list with state (verified/review/flagged), AI confidence, page count, version history (who/when/why), file storage + retrieval |
| **Money Journey** | Interactive pan/zoom canvas, 8 clickable fund-flow stage nodes (Treasury→State→District→Executing Agency→Contractor→Suppliers→Site→Completed Infrastructure), each with amount/status/confidence/evidence-present/evidence-missing, animated flow particles, play/pause | A genuine multi-hop disbursement chain per project — this does **not exist** in the current backend at all; currently 100% deterministically faked client-side from a hash of the project ID |
| **AI Verification** | Read-only pipeline view: 5 check scores (OCR/parsing, satellite geo-match, invoice cross-verify, CV progress estimate, anomaly detection) + AI findings list | Per-project verification run results — extends the existing single-shot `analyzeDocumentText` into a multi-check pipeline |
| **Reports** | 4 report types × 4 download formats (PDF/CSV/JSON/XBRL) | Real report generation, not just a summary object — needs actual file rendering per format |
| **Citizen View** | "I've seen this work locally" vote button, "Report an issue" button | Public engagement counters, issue-report submission |

### 1.6 `/verification` — AI Verification Engine (standalone demo)

"Run verification" button drives a 6-step animated pipeline over a 4-item "evidence bundle" (invoice, geo-photos, satellite scan, milestone scope sheet), ending in 5 check scores + 2 anomaly notes + a recommendation. Also has its own upload dropzone.

**Currently entirely scripted/fake** (`setInterval` stepping through a fixed script, no data in or out). In V2 this should become the generic entry point to the same multi-check AI Verification pipeline used by the Workspace tab — run against a chosen project + its uploaded documents.

### 1.7 `/explorer` — Transparency Explorer

4-stage fund-flow diagram (Treasury → Line Departments → Projects → Vendors), each stage clickable to filter a ledger table below (8 rows: from/to/amount/stage/status/time), search box, "leakage prevented" stat.

**Data dependency:** a **system-wide** ledger of money movements (not per-project) — treasury→department, department→project, project→vendor — aggregatable by stage and filterable.

### 1.8 `/citizen` — Citizen View

Hero search (city/district/project), 4 impact stats, "projects near you" grid (first 4, or search results) with Watch/👍 buttons, "Report an issue" form (project + free-text description) → success state with a reference code (`CR-90418`).

**Data dependency:** project search (possibly geo "near me"), watch/upvote counters, a citizen issue-report submission endpoint with an AI-triage queue.

### 1.9 `/reports` — Reports & Disclosures (global)

**Live monitoring map** embedded here too (existing). "Featured report" card with a format toggle and cryptographic-verification panel (document hash, signer, publish date, "anchor block" number). Report library grid (6 system-wide reports across Financial/Progress/Audit categories, each downloadable).

**Data dependency:** a `PublishedReport` catalogue, decoupled from any one project, each with a content hash and publish metadata.

### 1.10 `/about` — static marketing/mission content

No data dependency. No backend involvement needed.

### 1.11 Cross-cutting observations

- **Every button that looks like a mutation** (favorite, bookmark, watch, upvote, "I've seen this work locally") is currently local `useState` with no persistence. Whether these become real per-user or anonymous-aggregate counters is a product decision (§13).
- **All monetary figures are in crore (₹ Cr) as plain numbers.** The backend should store canonical amounts (see §4) and let the frontend keep doing `formatCrore()` — no backend changes needed to that formatter.
- **Every AI-flavored panel** (verification checks, anomaly findings, confidence scores) is currently either derived deterministically from static numbers or fully scripted. V2 needs one real, coherent **multi-check AI Verification pipeline** that every one of these UIs is a different view onto.

---

## 2. Data model gap analysis

| Frontend concept | Exists in current `Backend/`? | Gap |
|---|---|---|
| `Document`, basic `Report` (single AI analysis per document) | ✅ | Needs to become one of several evidence types attached to a `Project`, not the root entity |
| Project as a first-class entity (budget, phase, milestones, contractor, location) | ❌ | **New.** Today "projects" only exist implicitly as whatever a `Report` extracted from one document |
| Milestones (ordered, dated, fund-linked) | ❌ | **New** |
| Disbursement tranches | ❌ | **New** |
| Multi-hop fund-flow ledger (8-stage journey + explorer-wide ledger) | ❌ | **New** — the biggest structural gap |
| Document modules (Tender/BOQ/Invoices/Progress/Images) + versioning | Partial (`Document.type` is file-format, not module) | **Extend** |
| Multi-check AI verification (5 checks, findings, confidence) | Partial (`Report` has one `riskScore`/`confidence` from one prompt) | **Extend** significantly |
| Published reports (system-wide, multi-format, hash-anchored) | ❌ | **New** |
| Citizen issue reports | ❌ | **New** |
| Citizen engagement (watch/upvote) | ❌ | **New**, and needs a product decision on identity model |
| Category/state rollup stats, quarterly fund timeline | ❌ | **New** aggregation endpoints once `Project` exists |
| Auth (JWT issuing, bcrypt) | ✅ | Reuse as-is; just needs enforcement (already flagged as a gap in the existing README) |
| Geocoding | ✅ | Reuse as-is |
| Extraction (PDF/DOCX/OCR) | ✅ | Reuse as-is, becomes one stage of the richer AI pipeline |
| CORS, security middleware, logging, rate limiting | ✅ | Reuse as-is |

**Bottom line:** the existing `Backend/` is a solid *document-analysis* engine but has no concept of a *Project* as an entity with a lifecycle, a budget trail, or a multi-hop money story. V2's central move is introducing `Project` as the root aggregate and re-hanging everything else (documents, reports, milestones, disbursements, ledger entries) off of it.

---

## 3. Proposed folder structure

```
Backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── database.ts              # reuse
│   │   ├── env.ts                   # extend: gov-data source config, storage config
│   │   └── swagger.ts               # reuse
│   ├── models/
│   │   ├── Project.ts               # NEW — root aggregate
│   │   ├── Milestone.ts             # NEW
│   │   ├── Disbursement.ts          # NEW (tranches)
│   │   ├── LedgerEntry.ts           # NEW (fund-flow hops, project-scoped + system-wide)
│   │   ├── Document.ts              # extend: module, version chain, projectId
│   │   ├── Report.ts                # keep (per-document AI extraction), rename intent: EvidenceExtraction
│   │   ├── VerificationRun.ts       # NEW — multi-check AI verification result
│   │   ├── PublishedReport.ts       # NEW — system-wide report catalogue
│   │   ├── CitizenReport.ts         # NEW — issue reports
│   │   ├── Engagement.ts            # NEW — watch/upvote counters
│   │   ├── AuditLog.ts              # reuse
│   │   └── User.ts                  # reuse
│   ├── controllers/
│   │   ├── projectController.ts     # NEW
│   │   ├── milestoneController.ts   # NEW
│   │   ├── ledgerController.ts      # NEW (Explorer + Money Journey)
│   │   ├── documentController.ts    # extend
│   │   ├── analyzeController.ts     # extend → verificationController split-out
│   │   ├── verificationController.ts# NEW — multi-check pipeline trigger/read
│   │   ├── reportController.ts      # extend
│   │   ├── publishedReportController.ts # NEW
│   │   ├── citizenController.ts     # NEW
│   │   ├── dashboardController.ts   # extend heavily
│   │   ├── mapController.ts         # extend (project-level, not just report-level)
│   │   ├── activityController.ts    # reuse
│   │   ├── authController.ts        # reuse
│   │   └── uploadController.ts      # extend (module-aware)
│   ├── routes/                      # one router per controller above + index.ts
│   ├── services/
│   │   ├── govDataService.ts        # NEW — pluggable public-data ingestion adapter
│   │   ├── projectService.ts        # NEW — rollups, filtering, search
│   │   ├── ledgerService.ts         # NEW — fund-flow computation & aggregation
│   │   ├── verificationService.ts   # NEW — orchestrates the 5-check pipeline
│   │   ├── aiService.ts             # reuse, becomes one client used by verificationService
│   │   ├── extractionService.ts     # reuse
│   │   ├── ocrService.ts            # reuse
│   │   ├── pdfService.ts            # reuse (extraction) — separate from new report *rendering*
│   │   ├── docxService.ts           # reuse
│   │   ├── geocodingService.ts      # reuse
│   │   ├── reportRenderService.ts   # NEW — PDF/CSV/JSON/XBRL rendering
│   │   ├── hashAnchorService.ts     # NEW — tamper-evident hash chain for published reports
│   │   └── storageService.ts        # NEW — abstracts local-disk vs. object storage
│   ├── middleware/
│   │   ├── auth.ts                  # reuse, extend enforcement
│   │   ├── errorHandler.ts          # reuse
│   │   ├── rateLimiter.ts           # reuse
│   │   ├── upload.ts                # extend (module-aware storage keys)
│   │   └── validate.ts              # reuse
│   ├── jobs/
│   │   ├── govDataSyncJob.ts        # NEW — scheduled ingestion refresh
│   │   └── verificationQueueJob.ts  # NEW — async worker for long-running AI checks
│   ├── prompts/
│   │   ├── extractionPrompt.ts      # reuse
│   │   └── verificationPrompts.ts   # NEW — one prompt per check type
│   ├── types/index.ts               # extend
│   └── utils/                       # reuse (AppError, logger, schemas)
├── scripts/
│   └── seedFromGovData.ts           # NEW — one-time/backfill seeding CLI
```

Everything under `config/`, `middleware/` (except `upload.ts`), and most of `services/` is a straight carry-over — the existing engineering there is sound and should not be rewritten.

---

## 4. Data models

Only new/changed fields shown; assume `_id`, `createdAt`, `updatedAt` throughout.

### `Project` (new root aggregate)

```
sourceId: string                  // external gov-data identifier, unique, sparse (null for citizen/manual-only projects)
sourceProvider: string            // e.g. "data.gov.in", "manual" — see §11
name, category, department, state, district: string
location: { lat, lng, formattedAddress }   // reuse GeoLocation shape
sanctioned, released, utilized: number     // ₹ crore, canonical amounts
progress: number (0-100)                   // physical completion
integrity: number (0-100)                  // computed — see §4.1
status: "verified" | "pending" | "flagged" // computed — see §4.1
phase: "planned" | "in-progress" | "completed" | "delayed" | "verifying"
contractor: string
started, expectedCompletion: Date
stage: string                     // free-text current construction stage
image: string                     // storage key/URL
lastEventText: string             // denormalized cache of latest AuditLog entry, refreshed on write
milestonesTotal: number           // denormalized count, kept in sync with Milestone docs
milestonesDone: number
```

### `Milestone`

```
projectId: ObjectId (ref Project)
order: number
title, detail: string
plannedDate: Date
phase: "done" | "active" | "upcoming"
fundsLinked: number                // ₹ crore attributed to this milestone
evidenceDocumentIds: ObjectId[]    // ref Document
```

### `Disbursement` (tranches)

```
projectId: ObjectId
label: string                      // "Tranche 1"
amount: number
date: Date
state: "verified" | "review" | "flagged"
milestoneId?: ObjectId
```

### `LedgerEntry` (the central new concept — powers both Money Journey and Explorer)

```
projectId?: ObjectId               // null for pure inter-department entries not yet tied to a project
fromEntity: string                 // "Government Treasury" | "State Government" | ... | department/contractor name
toEntity: string
stage: "treasury" | "state" | "district" | "agency" | "contractor" | "supplier" | "site" | "completed"
amount: number
status: "verified" | "pending" | "flagged"
confidence: number                 // AI-derived, 0-100
evidenceAvailable: string[]        // document titles/types on file
evidenceMissing: string[]
note: string                       // human-readable reconciliation note
occurredAt: Date
```

A project's "Money Journey" is `LedgerEntry.find({ projectId }).sort({ stage's canonical order })`. The Explorer's system-wide flow/ledger is `LedgerEntry.find({})` aggregated by `stage`, independent of `projectId`.

### `Document` (extend existing)

```
+ projectId: ObjectId (ref Project)       // was previously unlinked to any project concept
+ module: "tender" | "boq" | "invoices" | "progress" | "images" | "other"
+ state: "verified" | "review" | "flagged"   // per-document AI verdict, distinct from Document.status (pipeline stage)
+ confidence: number
+ versions: [{ version, date, note, by, storageKey }]   // replaces single filePath with a version chain
(existing fields — fileName, originalName, mimeType, type, sizeBytes, status, extractedText, extractionMethod — all kept)
```

### `VerificationRun` (new — the multi-check AI pipeline result)

```
projectId: ObjectId
documentIds: ObjectId[]            // evidence bundle used
checks: [{
  key: "ocr_parsing" | "geo_match" | "invoice_crosscheck" | "progress_cv" | "anomaly_scan"
  label: string
  score: number (0-100)
  tone: "verified" | "pending" | "flagged"   // derived from score thresholds
}]
findings: [{ tone, title, detail }]
overallConfidence: number
recommendation: string
requestedBy: ObjectId (ref User)
status: "queued" | "running" | "done" | "failed"
```

### `PublishedReport` (new — system-wide Reports library)

```
title, summary: string
category: "Financial" | "Progress" | "Audit"
status: "verified" | "pending" | "flagged"
projectId?: ObjectId               // null for cross-project consolidated reports
formats: [{ format: "pdf"|"csv"|"json"|"xbrl", storageKey, sizeBytes }]
pageCount: number
contentHash: string                # sha256 of the canonical JSON payload
signedBy: string
anchorBlock: number                # sequential internal hash-chain position, see §9
publishedAt: Date
```

### `CitizenReport` (new)

```
projectId?: ObjectId
projectQueryText: string           # what the citizen typed if no project matched
description: string
status: "new" | "ai_reviewing" | "actioned" | "dismissed"
aiAssessment?: string
referenceCode: string              # "CR-90418" style, unique
anonymous: boolean (default true)
submitterHash?: string             # optional, only if abuse-prevention requires it — see §13
```

### `Engagement` (new — watch/upvote/"seen locally")

```
projectId: ObjectId
kind: "watch" | "upvote" | "seen_locally"
count: number
```
Kept as aggregate counters, not per-user rows, unless §13 resolves toward requiring citizen accounts.

### `User`, `AuditLog` — unchanged, reused as-is.

### 4.1 Computed fields — `integrity` and `status`

Today's frontend treats `integrity` and `status` as raw input data. In V2 they should be **computed, not stored as independent truth**, so they can never drift from the evidence that justifies them:

- `integrity` = weighted average of: this project's `VerificationRun.overallConfidence` (latest run), % of `Milestone`s with complete evidence, % of `LedgerEntry` stages with `status: verified`.
- `status` = `"flagged"` if any `LedgerEntry` or `Document` for the project is flagged; else `"pending"` if any verification is still running/queued or a required document module is empty; else `"verified"`.

This is the mechanism that makes "AI verification" *mean* something end to end, rather than being a label attached by whoever created the project record.

---

## 5. Services layer

| Service | Responsibility | Reuse/New |
|---|---|---|
| `govDataService` | Pluggable adapter: fetch + normalize project records from a configured public data source into `Project` upserts | New |
| `projectService` | Filtering/search/sort (backs `/projects` and Overview's search), category/state rollups, recompute `integrity`/`status` | New |
| `ledgerService` | Build a project's 8-stage journey from `LedgerEntry`, aggregate system-wide flow totals for Explorer | New |
| `verificationService` | Orchestrates the 5-check pipeline: calls `extractionService` → `ocrService` → `aiService` (per-check prompts) → `geocodingService` for the geo-match check → writes a `VerificationRun` | New, composes existing services |
| `aiService` | OpenAI-compatible chat completion client | Reuse unchanged; called by `verificationService` per check instead of once per document |
| `extractionService`, `ocrService`, `pdfService`, `docxService` | Text/OCR extraction | Reuse unchanged |
| `geocodingService` | Address → lat/lng | Reuse unchanged |
| `reportRenderService` | Render a `PublishedReport`/project report into PDF (pdfkit), CSV, JSON, and XBRL (XML) from canonical project+verification data | New |
| `hashAnchorService` | SHA-256 hash of a report's canonical payload, append to an internal sequential hash chain (`anchorBlock`), verify on demand | New |
| `storageService` | `save(buffer, key)` / `getUrl(key)` / `delete(key)`, backed by local disk in dev and object storage in production — see §10 | New, wraps `upload.ts`'s current direct-disk logic |

---

## 6. Controllers

One controller per resource, thin (parse request → call service/model → shape response), matching the existing codebase's proven pattern (`asyncHandler`, `AppError`, explicit status codes). No controller talks to Mongoose directly for anything beyond simple CRUD — cross-cutting logic (rollups, verification orchestration, ledger math) lives in services.

New controllers: `projectController`, `milestoneController`, `ledgerController`, `verificationController`, `publishedReportController`, `citizenController`.
Extended controllers: `documentController` (module + versions), `analyzeController` → thin wrapper delegating to `verificationService`, `dashboardController` (project-based rollups), `mapController` (project-level pins, not just per-report), `uploadController` (module-aware).
Unchanged: `authController`, `activityController`.

---

## 7. Routes — full API surface

Every endpoint the frontend needs, mapped to the page/component in §1 that consumes it.

```
Projects
  GET    /api/projects                       — filter/search/sort/paginate (Overview, /projects)
  GET    /api/projects/:id                    — single project (Workspace header + all tabs)
  GET    /api/projects/map                    — pins (existing endpoint, extended to Project)
  GET    /api/projects/near?lat=&lng=         — Citizen "near you"
  POST   /api/projects                        — manual project creation (admin/analyst)
  PATCH  /api/projects/:id                    — manual correction (admin/analyst)

Milestones
  GET    /api/projects/:id/milestones         — Workspace → Overview timeline
  POST   /api/projects/:id/milestones         — admin/analyst
  PATCH  /api/milestones/:id

Money Journey / Ledger
  GET    /api/projects/:id/ledger             — Workspace → Money Journey (8-stage)
  GET    /api/ledger                          — Explorer, system-wide, filterable by ?stage=
  GET    /api/ledger/summary                  — Explorer's 4 flow-node totals + "leakage prevented"

Documents (extends existing)
  GET    /api/projects/:id/documents?module=  — Workspace → Documents tab
  POST   /api/projects/:id/documents          — upload (module-aware; replaces bare /api/upload for project-scoped uploads)
  GET    /api/documents/:id                   — single document + version history
  DELETE /api/documents/:id

AI Verification (extends existing /api/analyze)
  POST   /api/projects/:id/verify             — run the 5-check pipeline (async — see §8), body: documentIds[]
  GET    /api/verification-runs/:id           — poll/read a run's result (Workspace → AI Verification, /verification)
  GET    /api/projects/:id/verification-runs   — history

Reports
  GET    /api/reports                         — Reports page library
  GET    /api/reports/:id                     — single report metadata
  GET    /api/reports/:id/download?format=    — file stream
  GET    /api/reports/:id/verify-hash         — cryptographic-verification panel
  POST   /api/projects/:id/reports/generate   — Workspace → Reports tab, body: { type, format }

Dashboard (extends existing)
  GET    /api/dashboard                       — Overview summary tiles, category rollups, state rollups
  GET    /api/dashboard/timeline              — quarterly sanctioned-vs-verified sparkline

Citizen
  POST   /api/citizen/reports                 — issue-report submission
  GET    /api/citizen/reports/:referenceCode  — status lookup
  POST   /api/projects/:id/engagement         — body: { kind: "watch"|"upvote"|"seen_locally" }

Auth, Activity (unchanged)
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/activity/live?limit=

Health
  GET    /health
```

All mounted under `/api` except `/health`, exactly matching the existing `app.ts` convention (`app.use("/api", routes)` before `notFoundHandler`/`errorHandler`).

---

## 8. Middleware

Reused as-is: `helmet`, the existing dynamic-origin `cors` config (already correct — see prior session), `express-rate-limit`, `express.json`, Zod `validateBody`, Multer `upload` (extended to accept a `module` field and route storage keys through `storageService`).

**JWT enforcement (closing the existing gap):**
- `authenticate` required on all `POST`/`PATCH`/`DELETE` routes except `POST /api/citizen/reports` and `POST /api/projects/:id/engagement` (intentionally anonymous, per §1.11/§13).
- `authorize("admin", "analyst")` required specifically on `POST/PATCH /api/projects`, `/milestones`, and manual `LedgerEntry` corrections.
- All `GET` routes remain public — this is a public-transparency product; read access should never require login.

**New:** an `asyncQueue` middleware/pattern for `POST /api/projects/:id/verify` — AI verification across 5 checks against multiple documents is too slow for a synchronous request/response cycle. The route should return `202 Accepted` with a `VerificationRun.status: "queued"` immediately, and a background job (§ jobs/verificationQueueJob.ts) processes it. The frontend's `/verification` page already has a natural "running…" UI state that maps directly onto polling `GET /api/verification-runs/:id`.

---

## 9. AI pipeline (extended)

Today: one prompt, one document, one JSON blob (`aiService.analyzeDocumentText`).

V2 — `verificationService.runVerification(projectId, documentIds)`:

```
1. Ingesting evidence bundle
   → for each documentId: extractionService.extractText() (reuse, unchanged)

2. OCR & parsing check
   → score = extraction success rate + text-quality heuristic

3. Invoice cross-verification
   → aiService call with a dedicated "invoice-vs-scope" prompt (prompts/verificationPrompts.ts),
     comparing invoice documents' extracted line items against the project's sanctioned scope

4. Satellite / geo-photo matching
   → geocodingService resolves the project's declared site; if image documents carry EXIF GPS,
     compare distance-from-declared-site (this is the one check that needs a new, small
     EXIF-reading step — no satellite-imagery API is assumed/required; documented as a
     configurable enhancement in §11, not a hard dependency)

5. Progress estimation
   → aiService call with a "progress-estimate" prompt over progress-report documents,
     cross-checked against Milestone.phase distribution

6. Anomaly / duplicate-claim detection
   → aiService call with an "anomaly-scan" prompt over invoice/BOQ documents
     (duplicate vendor hashes, amounts outside benchmark range)

7. Compile verdict
   → write VerificationRun with all 5 check scores + findings + overallConfidence
   → recompute Project.integrity / Project.status (§4.1)
   → AuditLog entry (`project.verify`)
```

Every check is env-gated the same way the existing `isAiConfigured()` gates `/api/analyze` today — if `AI_API_KEY` isn't set, checks 3/5/6 return a clear "AI not configured" state rather than failing the whole run (checks 1/2/4 can still produce partial results without an LLM).

---

## 10. Report pipeline (new)

Today there is no runtime report renderer — `Backend/scripts/generateDemoPdf.ts` is a one-off CLI demo generator, not part of the API.

`reportRenderService.render(project, verificationRun, format)`:
- **PDF** — `pdfkit` (already a dependency), structured sections mirroring the frontend's 4 report types (Financial Utilization Statement, Physical Progress Report, Integrity & Anomaly Summary, Citizen Transparency Sheet)
- **CSV** — flat tabular export of the same underlying data (ledger entries or milestone list, depending on report type)
- **JSON** — the canonical payload itself (also what gets hashed for §9's `contentHash`)
- **XBRL** — XML using the `financial` block already present in `Report`/`ExtractedProjectData`; scoped only to the Financial Utilization Statement report type, since XBRL is a financial-reporting standard and doesn't meaningfully apply to progress/citizen reports

Rendered files are written via `storageService` and referenced from `PublishedReport.formats[]`; `GET /api/reports/:id/download?format=` streams them.

---

## 11. Government data integration

This is the piece requiring a decision from you before implementation, because "real public government project data" isn't a single API — it's a category of very different sources depending on jurisdiction:

- **India Open Government Data Platform** (`data.gov.in`) — has infrastructure/scheme datasets, but they're published as periodic downloadable datasets (CSV/API with an API key), not a live "all active infrastructure projects" feed, and coverage/schema varies wildly by department/state.
- **PFMS** (Public Financial Management System) — tracks scheme-wise fund releases; strong for the "sanctioned/released" side of the model, weak on per-project physical-progress detail.
- **State-level PWD/e-procurement portals** — often the *only* place with per-project contractor/milestone/location detail, but each state runs its own portal with no common schema, and many don't expose a public API at all (would require scraping, which is fragile and may violate terms of use).

**Recommendation:** design `govDataService` as a **pluggable adapter interface** (mirroring the existing `aiService`'s "any OpenAI-compatible provider" pattern):

```
interface GovDataAdapter {
  fetchProjects(params): Promise<RawGovProject[]>
  normalize(raw: RawGovProject): Partial<Project>
}
```

Ship one concrete adapter first — the strongest realistic starting point is a `data.gov.in` adapter for whichever specific dataset(s) you have access to — behind `GOV_DATA_PROVIDER` / `GOV_DATA_API_KEY` env vars, exactly like `AI_API_URL`/`AI_API_KEY` today. `scripts/seedFromGovData.ts` runs it on demand; `jobs/govDataSyncJob.ts` re-syncs on a schedule (e.g. nightly) to pick up new/updated sanctioned projects. Records created this way get `sourceProvider` set and are never overwritten in fields a citizen/analyst has since corrected (`sourceProvider: "manual-override"` per-field tracking, or simpler: a `lockedFields: string[]` array on `Project`).

**Uploaded documents enrich, they don't replace:** a `Project` can exist purely from gov-data seeding with zero documents; uploading evidence against it (via the Documents tab) is what triggers `verificationService` and moves `status` from an unverified default toward `verified`/`flagged`. This is the literal mechanism behind "allow uploaded project documents to enrich that data through AI verification."

**Decision needed from you:** which specific data source(s) you have access to (an API key, a dataset export, or a specific state portal), since that determines the concrete adapter implementation. Until then, the architecture is source-agnostic and `Project` creation also works via the existing manual `POST /api/projects` (admin/analyst) as a fallback so the system isn't blocked on this integration.

---

## 12. Authentication strategy

Reuse the existing JWT + bcrypt implementation entirely (`middleware/auth.ts`, `authController.ts`, `User` model) — it's correctly built, just not enforced yet. V2 changes:

- **Enforce** `authenticate` on all mutating routes (§8), closing the gap the current README already documents.
- **Roles:** keep `admin` | `analyst` as-is; `admin` can manage users and override any project field, `analyst` can create/correct projects, milestones, and trigger verification runs.
- **No citizen accounts required for V1 of this redesign** — citizen actions (issue reports, watch/upvote) stay anonymous, matching the frontend's current "Reports are anonymous by default" copy on `/citizen`. If abuse becomes a concern, add lightweight rate-limiting by IP (already have `express-rate-limit`) before introducing citizen auth — don't build accounts speculatively.

---

## 13. Storage strategy

**This needs a decision, and it's more urgent than it looks:** Render's filesystem is **ephemeral** — anything written to local disk (`uploads/`, generated reports, `logs/`) is wiped on every redeploy and on every dyno restart. The current `Backend/` already writes uploaded files and generated reports to local disk (`middleware/upload.ts`'s `multer.diskStorage`, `env.uploadDir`), which works for local dev but **silently loses every uploaded document in production the moment Render restarts the service** (deploys, health-check-triggered restarts, free-tier sleep/wake cycles).

`storageService` should abstract this behind a single interface (`save`/`getUrl`/`delete`) with two implementations:
- **Local disk** — kept for local dev, identical to today's behavior.
- **Object storage** (S3-compatible — AWS S3, Cloudflare R2, or Backblaze B2 all work identically via the same S3 API and `aws-sdk`/`@aws-sdk/client-s3`) — required for production once this backend handles real documents that need to survive redeploys.

Env-gated exactly like `AI_API_URL`: `STORAGE_PROVIDER=local|s3`, `STORAGE_BUCKET`, `STORAGE_*_KEY`. **Decision needed from you:** which object storage provider you want to provision (or confirm Render's own persistent disk add-on, if you're on a paid tier that supports it, as an alternative to S3-compatible storage).

---

## 14. Error handling

Reuse the existing pattern entirely — it's well-designed: `AppError` (operational errors with explicit status codes), `asyncHandler` (catches rejected promises → `next(err)`), centralized `errorHandler` (logs 5xx as errors/4xx as warnings, never leaks stack traces in the response body), `notFoundHandler` for unmatched routes. New services (`verificationService`, `ledgerService`, `govDataService`, `reportRenderService`) throw `AppError` for expected failure modes (e.g., "no documents uploaded to verify," "unsupported report format," "gov-data source unreachable") and let unexpected errors bubble to the generic 500 path, exactly as today's controllers do.

---

## 15. Logging

Reuse Winston setup as-is (console + `logs/error.log` + `logs/combined.log`, redacted Mongo URI). Add structured log fields for the new async flows specifically, since they're the hardest to debug without them: every `VerificationRun` state transition (`queued`→`running`→`done`/`failed`) and every `govDataSyncJob` run (records fetched/created/updated/skipped) should log with `runId`/`jobId` so a single execution can be traced across log lines. **Note the same ephemeral-disk caveat as §13 applies to `logs/`** — if you want log history to survive redeploys, either ship logs to a hosted log sink (Render supports log streaming to third-party services) or accept that only the console/log-stream output (not the local files) is durable.

---

## 16. Validation

Reuse Zod (`utils/schemas.ts`) — extend with schemas for every new mutating route: `createProjectSchema`, `updateProjectSchema`, `createMilestoneSchema`, `citizenReportSchema`, `verificationRequestSchema` (documentIds array, non-empty), `reportGenerateSchema` (type/format enums). Same `validateBody` middleware, same error-shaping (`Validation error: field: message`) — no new pattern needed, just more schemas following the existing `registerSchema`/`loginSchema` shape.

---

## 17. Phased rollout (suggested, not prescriptive)

1. **`Project` as root aggregate** — model + migration of existing `Report`/`Document` data to reference a `Project` (one auto-created per existing unique `department`+`district` combination, or left project-less until manually linked — your call). Unlocks `/projects`, Workspace header, `/api/projects/map` upgrade.
2. **Milestones + Disbursements** — unlocks Workspace → Overview tab fully.
3. **LedgerEntry + ledgerService** — unlocks Money Journey tab and Explorer page. Largest new conceptual surface; can ship with manually/seed-generated ledger entries before real gov-data ingestion lands.
4. **Document modules + versioning** — unlocks Documents tab fully (upload already mostly works; this is schema + UI-shape work).
5. **verificationService (multi-check pipeline)** — unlocks AI Verification tab + `/verification` page for real.
6. **reportRenderService + PublishedReport + hashAnchorService** — unlocks Reports tab + `/reports` page.
7. **Citizen reports + engagement counters** — unlocks `/citizen` mutations.
8. **govDataService + first real adapter** — replaces manually-seeded/demo `Project` records with real sourced data; can start in parallel with step 1 once a data source is confirmed (§11).
9. **JWT enforcement flip** — turn on `authenticate`/`authorize` across mutating routes once an admin/analyst workflow actually exists to use them.

Each phase is independently shippable and testable against the frontend, since every phase maps to exactly one tab/page from §1.

---

## 18. Open questions requiring your decision before implementation

1. **Government data source** (§11) — which specific API/dataset/portal do you have access to?
2. **Object storage provider** (§13) — S3, R2, B2, or a different Render add-on?
3. **Citizen identity model** (§13) — stay fully anonymous (aggregate counters only), or do "watch"/"upvote" need to be per-citizen (requiring lightweight accounts or device fingerprinting)?
4. **Satellite imagery** (§9, check 4) — the design above uses EXIF-GPS-vs-declared-site as a real, buildable substitute for "satellite change detection." If you specifically want actual satellite imagery comparison, that requires a named provider (e.g., Sentinel Hub, Planet Labs) and a budget/API-key decision — flag if this is a hard requirement rather than a nice-to-have.
5. **XBRL scope** (§10) — confirm restricting XBRL export to the Financial Utilization Statement (not Progress/Citizen reports) matches your intent, since XBRL is a financial-data standard and doesn't naturally fit narrative reports.

---

**Nothing above has been implemented.** This document is the design; implementation should proceed phase-by-phase per §17 once the open questions in §18 are resolved (or explicitly deferred with a documented default).
