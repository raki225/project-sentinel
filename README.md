<div align="center">

# 🛰️ Project Sentinel

### AI-Powered Infrastructure Oversight & Decision Intelligence Platform

Turning raw government infrastructure documents into structured, geolocated, risk-scored intelligence — automatically.

[![Node](https://img.shields.io/badge/Node-%3E%3D18-339933?logo=node.js&logoColor=white)](Backend/package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](Backend/tsconfig.json)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](Backend/package.json)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?logo=mongodb&logoColor=white)](Backend/src/config/database.ts)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](frontend/package.json)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](frontend/package.json)
[![License](https://img.shields.io/badge/License-Unspecified-lightgrey.svg)](#-license)

[Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation) • [API Docs](#-api-documentation) • [AI Pipeline](#-ai-pipeline) • [Roadmap](#-future-roadmap)

</div>

---

## 📖 Overview

**Project Sentinel** ingests government infrastructure documents (PDF / DOCX / scanned images), extracts their text
via native parsing or OCR, sends the extracted text to a configurable AI provider for structured analysis, and
surfaces the result — project identity, budget, timeline, risks, and an AI-generated risk score — through a REST
API and a live dashboard.

The backend (`Backend/`) is a complete, working Node.js/Express/TypeScript/MongoDB pipeline. The frontend
(`frontend/`) is a Next.js 16 command-center UI: two of its widgets (the live map and the live activity feed) are
wired to the real backend today; the rest of the interface is a fully-built, richly interactive UI running on local
mock data, serving as the design target for wiring up the remaining screens. Every claim below is labeled
accordingly — nothing here is aspirational marketing copy.

> **Repo note:** this repository also contains orphaned root-level `app/`, `components/`, `lib/`, `public/` files
> from an earlier single-app layout that is mid-migration into the `frontend/` folder documented here. They are not
> covered by this README and should not be treated as part of the active project.

---

## ✅🚧🔮 Features

### ✅ Implemented — Backend (`Backend/`)

| Feature | Detail |
|---|---|
| Multi-format upload | PDF, DOCX, PNG, JPG/JPEG via Multer, MIME-allowlisted, size-capped (`MAX_FILE_SIZE_MB`) |
| Digital PDF text extraction | `pdfjs-dist` (legacy build), page-by-page text-layer extraction |
| DOCX text extraction | `mammoth` raw-text extraction |
| Image OCR | `tesseract.js` (English) with `sharp` pre-processing (grayscale, resize floor, normalize) |
| AI structured analysis | Calls any OpenAI-compatible `/chat/completions` endpoint (provider swappable via `.env` only) with a fixed JSON-extraction prompt |
| Best-effort geocoding | Google Maps Geocoding API resolves extracted district/department → `{ lat, lng, formattedAddress }`; never blocks analysis on failure |
| Persistence | MongoDB via Mongoose — `Document`, `Report`, `User`, `AuditLog` collections |
| Dashboard aggregates | Document/report counts, status & type breakdowns, avg. risk/confidence, high-risk count, recent documents |
| Per-document timeline | Audit-log event stream + report timeline/progress for one document |
| Live activity feed | Newest-first audit events (upload/analyze/delete) with derived severity |
| Project map data | Geocoded reports → map points with a computed risk tier (`low`/`medium`/`high`) and health score |
| Document management | Paginated/filterable listing, deletion (removes file + report + logs the action) |
| JWT auth (issuing) | `register` / `login` work end-to-end — bcrypt-hashed passwords, signed JWTs |
| API docs | Swagger/OpenAPI 3.0 auto-generated from route JSDoc, served at `/api-docs` |
| Security middleware | Helmet, CORS (origin-restricted via `CORS_ORIGIN`), `express-rate-limit`, Zod body validation, Multer MIME allowlist |
| Structured logging | Winston, file + console transports |
| Demo tooling | Synthetic sample PDF generator (`npm run generate-demo-pdf`) + a ready-to-import Postman collection |

### ✅ Implemented — Frontend (`frontend/`)

| Feature | Detail |
|---|---|
| 8-route command center | Overview, Projects, Workspace, AI Verification, Explorer, Citizen View, Reports, About — shared header/footer, dark/light theme |
| **Live map (real data)** | `ProjectMap` calls `GET /api/projects/map`; renders actual geocoded reports on a Leaflet/OpenStreetMap map of India, colored by risk tier; falls back to labeled sample pins only when the backend has zero geocoded reports yet |
| **Live activity feed (real data)** | `LiveActivityFeed` polls `GET /api/activity/live` every 10s and renders real audit events |
| Project registry UI | Search, filter (category/phase/transparency tier/budget/completion), sort, grid/list toggle — over a local mock dataset (`lib/sentinel-data.ts`) |
| Workspace UI | Per-project tabs: Overview, Documents, Money Journey, AI Verification, Reports, Citizen View — mock data |
| Transparency Explorer | Fund-flow diagram + filterable ledger table — mock data |
| Citizen View | Public search + "report an issue" form — client-side only |
| Verification engine demo | Scripted step-by-step animation of an evidence-verification run — mock data |

### 🚧 In Progress / Partially Wired

| Item | Current state |
|---|---|
| Frontend document upload | `DocumentModulesPanel` (Workspace → Documents tab) is explicitly a **client-side simulation** (its own source comment: *"frontend only, no APIs / mock JSON"*) — it never calls `POST /api/upload` or `POST /api/analyze/:id` |
| JWT enforcement | `authenticate`/`authorize` middleware exists and works, but is **not applied** to `upload`, `analyze`, `report`, `documents`, or `dashboard` routes — currently open to anyone who can reach the API |
| AI provider config | `analyzeDocumentText` requires `AI_API_KEY` / `AI_API_URL` / `AI_MODEL` to be set to a working OpenAI-compatible provider; ships unset/unverified by default |
| Scanned (image-only) PDFs | Detected (`isLikelyScanned`) but **not** rasterized + OCR'd — no PDF→image renderer is wired in; API returns a 422 asking for page images instead |
| Citizen issue reports | Form submission is simulated (`setSent(true)`) — no backend endpoint exists to receive it |

### 🔮 Planned (not present in code — UI copy only, do not treat as implemented)

- Wiring the Workspace upload UI to the real `/api/upload` → `/api/analyze/:id` pipeline
- Re-enabling JWT auth + role-based access (`authorize("admin" | "analyst")` is already scaffolded, just unused)
- PDF-to-image rendering for scanned document OCR
- A backend endpoint + moderation queue for citizen-submitted issue reports
- Report export in CSV / JSON / XBRL (UI has a format toggle; only PDF-shaped mock data exists, no export routes)
- "Satellite imagery cross-check," "cryptographic hash-anchoring," and "invoice-to-evidence reconciliation" — these
  appear only as descriptive copy in the mock Verification/Reports pages; there is no model, hashing, or imagery
  service behind them in this codebase

---

## 🖼️ Screenshots

> Add screenshots as the UI stabilizes. Suggested capture list:

```
docs/screenshots/dashboard.png       — Overview command center (live stats + map)
docs/screenshots/upload.png          — Workspace → Documents upload flow
docs/screenshots/report.png          — Generated AI report view
docs/screenshots/map.png             — Live project map (India, risk-colored pins)
```

---

## 🏗️ Architecture

```
                        ┌──────────────────────┐
                        │        User           │
                        └──────────┬────────────┘
                                   │
                                   ▼
                  ┌────────────────────────────────┐
                  │   Frontend — Next.js 16 / React │
                  │   (frontend/)                   │
                  │   - Live map + activity feed     │
                  │     call the real API            │
                  │   - Remaining screens run on      │
                  │     local mock data (🚧)          │
                  └──────────────┬───────────────────┘
                                 │ REST (fetch, JSON)
                                 ▼
                  ┌────────────────────────────────┐
                  │   Backend — Express + TypeScript │
                  │   (Backend/)                     │
                  │   Helmet · CORS · Rate limiting  │
                  │   Zod validation · Multer upload │
                  └──────────────┬───────────────────┘
                                 │
                 ┌───────────────┼────────────────────┐
                 ▼               ▼                     ▼
        ┌────────────────┐ ┌──────────────┐   ┌──────────────────┐
        │ Text Extraction │ │  AI Engine    │   │  Geocoding        │
        │ pdfjs-dist      │ │  (env-driven  │   │  Google Maps API  │
        │ mammoth (DOCX)  │ │  OpenAI-      │   │  (best-effort)    │
        │ Tesseract OCR   │ │  compatible)  │   └──────────────────┘
        │ + sharp         │ └──────┬────────┘
        └────────┬────────┘        │
                 │                 ▼
                 │        Structured JSON:
                 │        project, budget, risks,
                 │        riskScore, confidence,
                 │        executive summary
                 ▼                 │
        ┌──────────────────────────▼───────────────┐
        │              MongoDB (Mongoose)            │
        │   Document · Report · User · AuditLog      │
        └──────────────────┬─────────────────────────┘
                            │
                            ▼
                ┌────────────────────────┐
                │   REST responses:        │
                │   /report/:id            │
                │   /dashboard              │
                │   /timeline/:id           │
                │   /projects/map           │
                │   /activity/live          │
                └────────────────────────┘
```

---

## 📁 Folder Structure

```
project-sentinel/
│
├── Backend/                        # Express + TypeScript API (real, working)
│   ├── src/
│   │   ├── app.ts                  # Express app wiring (helmet, cors, routes, error handler)
│   │   ├── server.ts               # Entrypoint — DB connect + listen
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── env.ts              # Typed env accessor + isAiConfigured()/isGeocodingConfigured()
│   │   │   └── swagger.ts
│   │   ├── controllers/
│   │   │   ├── activityController.ts
│   │   │   ├── analyzeController.ts
│   │   │   ├── authController.ts
│   │   │   ├── dashboardController.ts
│   │   │   ├── documentController.ts
│   │   │   ├── mapController.ts
│   │   │   ├── reportController.ts
│   │   │   ├── timelineController.ts
│   │   │   └── uploadController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT authenticate/authorize (built, not enforced)
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   ├── upload.ts           # Multer config + MIME allowlist
│   │   │   └── validate.ts         # Zod body validation
│   │   ├── models/
│   │   │   ├── AuditLog.ts
│   │   │   ├── Document.ts
│   │   │   ├── Report.ts
│   │   │   └── User.ts
│   │   ├── prompts/
│   │   │   └── extractionPrompt.ts # The AI system/user prompt
│   │   ├── routes/                 # Express routers + OpenAPI JSDoc
│   │   ├── services/
│   │   │   ├── aiService.ts        # OpenAI-compatible chat completion client
│   │   │   ├── docxService.ts      # mammoth
│   │   │   ├── extractionService.ts# Routes file type → extractor
│   │   │   ├── geocodingService.ts # Google Maps Geocoding
│   │   │   ├── ocrService.ts       # tesseract.js + sharp
│   │   │   └── pdfService.ts       # pdfjs-dist
│   │   ├── types/index.ts
│   │   └── utils/
│   │       ├── AppError.ts
│   │       ├── logger.ts           # Winston
│   │       └── schemas.ts          # Zod schemas
│   ├── scripts/generateDemoPdf.ts  # Synthetic sample document generator
│   ├── demo/sample-infrastructure-report.pdf
│   ├── postman/Project-Sentinel.postman_collection.json
│   ├── uploads/                    # Uploaded files land here (gitignored)
│   ├── reports/                    # (gitignored)
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md                   # Backend-specific setup notes
│
├── frontend/                       # Next.js 16 / React 19 UI
│   ├── app/
│   │   ├── page.tsx                # Overview / command center
│   │   ├── projects/page.tsx       # Project registry (mock data)
│   │   ├── workspace/page.tsx      # Per-project workspace (mock data)
│   │   ├── verification/page.tsx   # AI verification demo (mock data)
│   │   ├── explorer/page.tsx       # Transparency / fund-flow explorer (mock data)
│   │   ├── citizen/page.tsx        # Citizen-facing search + report form (mock)
│   │   ├── reports/page.tsx        # Reports library + LIVE map
│   │   ├── about/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── site-header.tsx / site-footer.tsx / theme-provider.tsx
│   │   ├── ui/button.tsx
│   │   └── sentinel/
│   │       ├── project-map.tsx         # LIVE — calls GET /api/projects/map
│   │       ├── live-activity-feed.tsx  # LIVE — polls GET /api/activity/live
│   │       ├── document-modules.tsx    # Simulated upload UI (no API calls)
│   │       ├── workspace-panels.tsx
│   │       ├── rupee-journey.tsx
│   │       ├── project-card.tsx
│   │       ├── primitives.tsx          # Reveal, AnimatedNumber, ProgressRing, etc.
│   │       └── brand-mark.tsx
│   ├── lib/
│   │   ├── api.ts                  # Typed fetch client for the real backend
│   │   ├── sentinel-data.ts        # Mock project dataset powering most screens
│   │   ├── demo-map-data.ts        # Fallback pins shown when no real reports exist
│   │   ├── map-marker.ts
│   │   └── utils.ts
│   ├── public/projects/*.png
│   ├── .env.example
│   ├── next.config.mjs
│   ├── package.json
│   └── README.md
│
└── README.md                       # You are here
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend framework** | Next.js 16 (App Router, `--webpack`), React 19 |
| **Frontend styling** | Tailwind CSS 4, `tailwind-merge`, `class-variance-authority`, shadcn (`components.json`) |
| **Frontend maps** | Leaflet + `react-leaflet` (OpenStreetMap tiles), plus `d3-geo`/`topojson-client` in the legacy root app |
| **Frontend icons/motion** | `lucide-react`, `next-themes`, CSS-driven reveal/animation primitives |
| **Backend framework** | Express 4 on Node.js ≥ 18, TypeScript 5.7 |
| **Database** | MongoDB via Mongoose 8 |
| **AI** | Any OpenAI-compatible `/chat/completions` provider — key/URL/model fully env-driven, zero hardcoded vendor |
| **OCR** | Tesseract.js 5 + Sharp (image pre-processing) |
| **Document parsing** | `pdfjs-dist` (digital PDFs), `mammoth` (DOCX), `pdfkit` (demo PDF generation) |
| **Geocoding** | Google Maps Geocoding API |
| **Auth** | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` — implemented, not yet enforced on routes |
| **Validation** | Zod |
| **API docs** | `swagger-jsdoc` + `swagger-ui-express` |
| **Security middleware** | Helmet, CORS, `express-rate-limit` |
| **Logging** | Winston |
| **Deployment** | 🚧 Not configured in-repo — no Dockerfile, CI workflow, or deploy config present |

---

## ⚙️ Installation

### Prerequisites

- Node.js ≥ 18
- A MongoDB instance (local `mongod` or Atlas)
- (Optional but required for `/api/analyze`) An OpenAI-compatible AI API key
- (Optional) A Google Maps Geocoding API key

### 1. Clone

```bash
git clone <this-repo-url>
cd project-sentinel
```

### 2. Backend setup

```bash
cd Backend
npm install
cp .env.example .env      # fill in the values — see Environment Variables below
npm run dev                # starts on http://localhost:5000 (ts-node + nodemon)
```

Swagger docs: `http://localhost:5000/api-docs`
Health check: `http://localhost:5000/health`

### 3. Frontend setup

```bash
cd frontend
npm install                # or pnpm install (pnpm-lock.yaml is present)
cp .env.example .env.local # set NEXT_PUBLIC_API_URL if backend isn't on localhost:5000
npm run dev                 # starts on http://localhost:3000
```

### 4. MongoDB

```bash
# Local
mongod --dbpath ./.mongo-data

# or point MONGODB_URI in Backend/.env at an Atlas cluster
```

### 5. (Optional) Generate the demo document

```bash
cd Backend
npm run generate-demo-pdf   # writes demo/sample-infrastructure-report.pdf
```

Then exercise the full pipeline via the Postman collection at `Backend/postman/Project-Sentinel.postman_collection.json`,
or `curl`:

```bash
curl -F "file=@Backend/demo/sample-infrastructure-report.pdf" http://localhost:5000/api/upload
curl -X POST http://localhost:5000/api/analyze/<documentId>
curl http://localhost:5000/api/report/<documentId>
```

---

## 🔑 Environment Variables

### `Backend/.env`

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | No | `5000` | API port |
| `NODE_ENV` | No | `development` | Environment name |
| `MONGODB_URI` | Yes | `mongodb://127.0.0.1:27017/project_sentinel` | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Signs JWTs; server throws on boot if unset |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime |
| `AI_API_KEY` | For `/api/analyze` | *(empty)* | Bearer key for the AI provider |
| `AI_API_URL` | For `/api/analyze` | *(empty)* | Base URL, no trailing `/chat/completions` |
| `AI_MODEL` | For `/api/analyze` | *(empty)* | Model name passed to the provider |
| `GOOGLE_MAPS_API_KEY` | No | *(empty)* | Enables geocoding; analysis works without it, just skips `location` |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed frontend origin |
| `UPLOAD_DIR` | No | `uploads` | Where uploaded files are stored |
| `MAX_FILE_SIZE_MB` | No | `25` | Multer upload size limit |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate-limit window (15 min) |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window per IP |

`aiService.ts` calls `POST {AI_API_URL}/chat/completions` with an OpenAI-compatible body — works with OpenAI, Groq,
OpenRouter, or any compatible proxy by editing `.env` only. Native Gemini's API shape differs and would need
`aiService.ts` adapted.

### `frontend/.env.local`

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:5000/api` | Base URL the frontend's `lib/api.ts` fetch client targets |

---

## 📡 API Documentation

Full interactive Swagger UI is served at `GET /api-docs` once the backend is running. Summary:

<details>
<summary><b>Auth</b></summary>

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create a user (`name`, `email`, `password`, optional `role`). Returns a JWT. |
| `POST` | `/api/auth/login` | — | Log in with `email`/`password`. Returns a JWT. |

</details>

<details>
<summary><b>Documents & Analysis</b></summary>

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/upload` | none¹ | Multipart upload, field name `file`. Returns `documentId`, `fileName`, `type`. |
| `POST` | `/api/analyze/:id` | none¹ | Runs extraction (PDF/DOCX/OCR) + AI analysis + geocoding; upserts a `Report`. Returns the full report. |
| `GET` | `/api/report/:id` | none¹ | Fetch the generated report for a document. |
| `GET` | `/api/documents` | none¹ | Paginated list. Query: `page`, `limit`, `status`, `type`. |
| `DELETE` | `/api/documents/:id` | none¹ | Deletes the document, its report, and its file on disk. |

¹ JWT middleware exists (`src/middleware/auth.ts`) but is not applied to these routes — see 🚧 above.

</details>

<details>
<summary><b>Dashboard, Timeline, Map, Activity</b></summary>

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Aggregate stats: totals, status/type breakdowns, avg. risk/confidence, high-risk count, 5 most recent documents. |
| `GET` | `/api/timeline/:id` | Report timeline/progress + chronological audit-log events for one document. |
| `GET` | `/api/projects/map` | Geocoded report points with a computed `risk` tier (`low`/`medium`/`high`) and `health` score, for map rendering. |
| `GET` | `/api/activity/live?limit=20` | Newest-first audit events with a human-readable title and derived severity. |
| `GET` | `/health` | Liveness check. |

</details>

**Example — `POST /api/analyze/:id` response (shape):**

```json
{
  "success": true,
  "documentId": "665f1c...",
  "report": {
    "projectName": "Rajapuram-Kondapally Highway Widening (Phase II)",
    "department": "Public Works Department (PWD)",
    "district": "Kondapally District",
    "budget": "INR 84.5 Crore",
    "contractor": "Sri Balaji Infra Constructions Pvt. Ltd.",
    "timeline": "Start: 12 Jan 2023 | Revised Completion: 30 Jun 2025",
    "progress": "68% complete",
    "financial": { "allocatedBudget": "...", "spentToDate": "...", "variance": "...", "currency": "INR" },
    "risks": ["..."],
    "missingInformation": ["..."],
    "confidence": 82,
    "riskScore": 41,
    "executiveSummary": "...",
    "aiRecommendation": "...",
    "location": { "lat": 16.5, "lng": 80.6, "formattedAddress": "..." }
  }
}
```

---

## 🤖 AI Pipeline

```
Upload (PDF/DOCX/PNG/JPG)
        │
        ▼
Type-routed extraction
  • pdf  → pdfjs-dist text layer (falls back to a 422 "scanned PDF" warning if empty)
  • docx → mammoth raw text
  • image→ sharp preprocess (grayscale, resize, normalize) → Tesseract.js OCR
        │
        ▼
AI analysis (aiService.ts)
  • POST {AI_API_URL}/chat/completions, OpenAI-compatible body
  • System prompt (prompts/extractionPrompt.ts) enforces strict JSON output:
    projectName, department, district, budget, contractor, timeline, progress,
    financial{}, risks[], missingInformation[], confidence, riskScore,
    executiveSummary, aiRecommendation
        │
        ▼
Risk scoring & confidence
  • Both are produced directly by the AI model per the prompt's rules
  • Clamped server-side to 0–100 (analyzeController.toNumber)
        │
        ▼
Geocoding (best-effort)
  • district + department → Google Maps Geocoding API → { lat, lng, formattedAddress }
  • Never fails the request; location is simply omitted on no-match
        │
        ▼
Persistence
  • Report upserted in MongoDB (1:1 with Document via documentId)
  • Document.status → analyzed | failed
  • AuditLog entry recorded (document.analyze)
        │
        ▼
Timeline & Report Generation
  • GET /api/report/:id — full structured report
  • GET /api/timeline/:id — report progress + chronological audit events
        │
        ▼
Dashboard
  • GET /api/dashboard — aggregate counts, avg. risk/confidence, high-risk count
  • GET /api/projects/map — geocoded points for the live map (frontend: real data)
  • GET /api/activity/live — recent events (frontend: real data)
```

---

## 🔄 Project Workflow

1. A document is uploaded via `POST /api/upload` — stored on disk (`uploads/`), a `Document` row is created with
   status `uploaded`, and an `AuditLog` entry (`document.upload`) is written.
2. `POST /api/analyze/:id` is called (manually today — the frontend doesn't trigger this yet). Status moves to
   `processing`, text is extracted, then sent to the AI provider.
3. The AI's structured JSON is parsed, clamped, and upserted into the `Report` collection; geocoding is attempted;
   `Document.status` becomes `analyzed` (or `failed`, with `errorMessage`, on any error in the try block).
4. `GET /api/report/:id` serves the finished report. `GET /api/timeline/:id` shows the audit trail for that
   document. `GET /api/dashboard`, `/api/projects/map`, and `/api/activity/live` aggregate across all documents.
5. On the frontend, the homepage and Reports page render the live map and live activity feed from these real
   endpoints; every other screen (Projects, Workspace, Verification, Explorer, Citizen View) currently renders the
   local mock dataset in `lib/sentinel-data.ts`.

---

## 🔐 Security

| Control | Status |
|---|---|
| Helmet security headers | ✅ Active on every request |
| CORS | ✅ Restricted to `CORS_ORIGIN` |
| Rate limiting | ✅ `express-rate-limit`, configurable window/max |
| Input validation | ✅ Zod schemas on `/auth/register` and `/auth/login` |
| File upload validation | ✅ Multer MIME-type allowlist + size cap |
| Password hashing | ✅ bcrypt, 12 salt rounds |
| JWT signing | ✅ Implemented (`jsonwebtoken`) |
| **JWT enforcement** | 🚧 Middleware exists but is not applied to upload/analyze/report/documents/dashboard — anyone reaching the API can call them |
| Role-based access | 🚧 `authorize(...roles)` exists, unused |
| Secrets handling | `.env` is gitignored in both `Backend/` and `frontend/`; rotate `JWT_SECRET` and all API keys before real deployment |

---

## ⚡ Performance

| Aspect | Status |
|---|---|
| OCR image preprocessing | ✅ `sharp` grayscale/resize/normalize before Tesseract to improve accuracy and throughput |
| Aggregate queries | ✅ MongoDB aggregation pipelines for dashboard stats (single round-trip per metric group) |
| Frontend map loading | ✅ `next/dynamic` with `ssr: false` for the Leaflet map, with a loading skeleton |
| Frontend live feed | ✅ Lightweight 10s polling (`setInterval`), not a websocket/streaming connection |
| Caching | 🚧 None implemented (no Redis/HTTP caching layer) |
| Response streaming | 🚧 None — AI responses are awaited in full before returning |
| Pagination | ✅ `/api/documents` supports `page`/`limit` |

---

## 🗺️ Future Roadmap

Derived from the 🚧/🔮 gaps identified above — not speculative additions:

- [ ] Wire the Workspace upload UI to real `POST /api/upload` + `POST /api/analyze/:id`
- [ ] Enforce JWT auth (and role checks) on upload/analyze/report/documents/dashboard routes
- [ ] Fix/verify AI provider credentials so `/api/analyze` runs end-to-end out of the box
- [ ] Add a PDF→image renderer to support OCR on scanned (image-only) PDFs
- [ ] Backend endpoint + storage for citizen-submitted issue reports
- [ ] Report export endpoints (CSV / JSON / XBRL) to back the existing frontend format toggle
- [ ] Replace the remaining mock-data screens (Projects, Explorer, Verification, Citizen View) with live API calls
- [ ] Add automated tests (none currently exist in either `Backend/` or `frontend/`)
- [ ] Add CI/CD and a Dockerfile (none currently exist)
- [ ] Resolve the orphaned root-level legacy app files (migrate or remove)

---

## 📄 License

🚧 No `LICENSE` file is currently present in this repository. All rights reserved by default until one is added —
add a `LICENSE` file and update this section before treating the project as open source.

---

## 👥 Contributors

Detected from Git history:

| Contributor |
|---|
| Venkataramana Emmadoju |
| Rakesh Sivala|
| v0 (v0.app automated commits) |

---

## 🙏 Acknowledgements

- [pdfjs-dist](https://github.com/mozilla/pdf.js), [Tesseract.js](https://github.com/naptha/tesseract.js), and
  [mammoth.js](https://github.com/mwilliamson/mammoth.js) for document parsing and OCR
- [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/copyright) for map rendering
- [shadcn/ui](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com/) for the frontend design system
- Built and iterated on with [v0.app](https://v0.app)
