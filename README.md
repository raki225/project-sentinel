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

> [!IMPORTANT]
> ## 🔴 Demo Data Disclaimer
>
> **Project Sentinel does NOT contain or use any real Government, Public Infrastructure, or Confidential data.**
>
> All documents, reports, invoices, images, maps, dashboards, AI outputs, project records, analytics, and datasets included in this repository are **synthetically generated demo data** created solely to demonstrate the platform's workflow, AI capabilities, and user experience.
>
> This project was built for educational purposes, research, hackathons, and portfolio demonstrations.
>
> **No official government datasets, classified documents, confidential infrastructure records, or sensitive public-sector information are stored, processed, or distributed within this repository.**
>
> The demo dataset is included only to demonstrate the complete workflow, including:
>
> - Document Upload
> - OCR & Text Extraction
> - AI Document Analysis
> - Image Verification
> - Risk Assessment
> - Fraud Detection
> - Timeline Analysis
> - Interactive Dashboard
> - Explainable AI Insights
> - Report Generation
> - End-to-End Infrastructure Monitoring Workflow
>
> **Any resemblance to actual projects, government departments, contracts, organizations, or locations is purely coincidental.**

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
| Persistence | MongoDB via Mongoose — `Project`, `Document`, `Report`, `User`, `AuditLog`, `GovDataSyncRun` collections |
| Government open-data ingestion | Pluggable fetchers (data.gov.in keyed API, generic CSV/XLSX/JSON/XML/ZIP file URLs) → parsers → configurable-field-map normalizer → MongoDB, on a 24h scheduler (`node-cron`); full run history kept in `GovDataSyncRun` |
| AI risk enrichment | Deterministic scoring of every project — budget outliers vs. departmental median, timeline delays, duplicate site coordinates, budget-vs-progress mismatches — written to `Project.riskScore`/`anomalies[]` and the activity feed |
| Dashboard aggregates | Document/report counts, status & type breakdowns, avg. risk/confidence, high-risk count, recent documents — plus project status/state/department rollups |
| Per-document timeline | Audit-log event stream + report timeline/progress for one document |
| Live activity feed | Newest-first audit events (upload/analyze/delete, AI anomaly findings, gov-data syncs) with derived severity |
| Project map data | Geocoded projects (government data + AI-analyzed reports) → map points with a computed risk tier (`low`/`medium`/`high`) and health score |
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
│   │   │   ├── projectController.ts # Government-data-backed project list/detail
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
│   │   │   ├── GovDataSyncRun.ts   # Ingestion run history (records fetched/created/updated/skipped)
│   │   │   ├── Project.ts          # Government-data-backed project (root entity), incl. AI riskScore/anomalies
│   │   │   ├── Report.ts
│   │   │   └── User.ts
│   │   ├── ingestion/               # Government open-data pipeline
│   │   │   ├── fetchers/           # GovApiFetcher (data.gov.in), FileUrlFetcher (CSV/XLSX/XML/ZIP)
│   │   │   ├── parsers/            # csv/xlsx/json/xml/zip → raw records
│   │   │   ├── normalizers/        # raw record + field map → canonical Project fields
│   │   │   ├── schedulers/         # node-cron daily resync
│   │   │   ├── config.ts           # loads config/gov-data-sources.json
│   │   │   ├── demoSeed.ts         # labeled demo fallback, seeded only when DB is empty
│   │   │   └── govDataSyncService.ts
│   │   ├── prompts/
│   │   │   └── extractionPrompt.ts # The AI system/user prompt
│   │   ├── routes/                 # Express routers + OpenAPI JSDoc
│   │   ├── services/
│   │   │   ├── aiService.ts        # OpenAI-compatible chat completion client
│   │   │   ├── docxService.ts      # mammoth
│   │   │   ├── extractionService.ts# Routes file type → extractor
│   │   │   ├── geocodingService.ts # Google Maps Geocoding
│   │   │   ├── ocrService.ts       # tesseract.js + sharp
│   │   │   ├── pdfService.ts       # pdfjs-dist
│   │   │   ├── projectService.ts   # prefer-real-else-demo project queries
│   │   │   └── riskEnrichmentService.ts # deterministic risk score + anomaly detection
│   │   ├── types/index.ts
│   │   └── utils/
│   │       ├── AppError.ts
│   │       ├── logger.ts           # Winston
│   │       └── schemas.ts          # Zod schemas
│   ├── scripts/generateDemoPdf.ts  # Synthetic sample document generator
│   ├── config/gov-data-sources.example.json # Template — copy to gov-data-sources.json to go live
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

## 🏛️ Government Open Data

Project Sentinel ingests **official Government of India open data** wherever a real, licensed, publicly accessible
dataset exists — it does not run on invented project records. The design principle:

- **Uses official Government Open Data wherever available.** The ingestion pipeline (`Backend/src/ingestion/`) is
  built against the confirmed, documented [data.gov.in](https://data.gov.in) Open Government Data (OGD) Platform
  resource API contract (`api-key` + `resource-id` + paginated `format=json`), plus a generic file-based fetcher for
  datasets published as direct CSV/XLSX/XML/ZIP downloads (the mechanism [NDAP](https://ndap.niti.gov.in) and many
  ministry portals actually use). Every dataset it syncs is one **you** configure and verify — see
  `Backend/config/gov-data-sources.example.json` and `GOV_DATA_*` below.
- **No confidential or restricted government systems are accessed, ever.** Only publicly licensed open-data
  catalogs and APIs are supported. Internal ministry project-management systems, live contractor payment systems,
  and any system requiring government-side authorization are out of scope by design — the ingestion pipeline has no
  code path that could reach them.
- **Demo data is included only where a real dataset isn't configured yet**, and is always clearly labeled
  (`isDemo: true`, `sourceProvider: "demo"` on every record, surfaced in the `GET /api/projects`,
  `GET /api/projects/map`, and `GET /api/dashboard` responses). It is never presented as real, and it automatically
  stops being served the moment any real project data exists in the database — see `services/projectService.ts`'s
  prefer-real-else-demo fallback.
- **AI enrichment runs on whatever is actually in the database** — real synced projects or the labeled demo
  fallback, never fabricated figures. A deterministic, explainable rule engine
  (`services/riskEnrichmentService.ts`) computes each project's risk score and flags budget outliers, timeline
  delays, duplicate locations, and budget-vs-progress mismatches; every finding is recorded as an audit-log entry
  and surfaced through the existing `GET /api/activity/live` feed.

**To wire in a real dataset:** register a free API key at [data.gov.in](https://data.gov.in), find a real
infrastructure-related resource (e.g. the Infrastructure sector catalog, or a scheme like PMGSY), copy
`Backend/config/gov-data-sources.example.json` to `gov-data-sources.json`, fill in the resource id and a field
mapping for that dataset's actual column names, then set `GOV_DATA_API_KEY` and `GOV_DATA_SOURCES_FILE` in
`Backend/.env`. The sync runs automatically on startup and every 24 hours thereafter (`GOV_DATA_SYNC_CRON`); history
of every run — records fetched/created/updated/skipped — is kept in the `GovDataSyncRun` collection.

Full design rationale, including which specific data sources were evaluated and why no resource id ships
preconfigured, is in [`docs/architecture/BACKEND_V2_ARCHITECTURE.md`](docs/architecture/BACKEND_V2_ARCHITECTURE.md).

---

## ⚠️ Demo Dataset (document-analysis pipeline)

The document upload → OCR → AI-analysis pipeline (`POST /api/upload`, `POST /api/analyze/:id`) is separate from
project-level government data above — it's the mechanism by which **uploaded evidence enriches a project's
record**. Real government infrastructure *documents* (contracts, invoices, progress certificates) can't be included
in this repository for the same privacy/confidentiality/legal reasons as above, so a realistic **synthetic** demo
document is provided instead (see `Backend/demo/` and `npm run generate-demo-pdf` above).

The pipeline's workflow — extraction, OCR, AI analysis, geocoding, risk scoring, and reporting — remains **exactly
the same** as it would be with real-world documents; only the input file is synthetic. Uploading a real document
against a real (gov-data-sourced) project requires no code changes.

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
| `GOV_DATA_API_KEY` | For real gov-api sources | *(empty)* | Shared data.gov.in account key, used across all configured resource ids |
| `GOV_DATA_API_BASE_URL` | No | `https://api.data.gov.in` | OGD Platform API base URL |
| `GOV_DATA_SOURCES_FILE` | No | *(empty)* | Path to your dataset config (see `config/gov-data-sources.example.json`); unset ⇒ demo data only |
| `GOV_DATA_SYNC_CRON` | No | `0 3 * * *` | Cron schedule for the automatic resync |
| `GOV_DATA_SYNC_ON_STARTUP` | No | `true` | Also sync once immediately when the server boots |

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
<summary><b>Projects (government open data)</b></summary>

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/projects` | Paginated/filterable/searchable project list. Query: `page`, `limit`, `state`, `department`, `status`, `q`. Real (gov-data-sourced) records are served whenever any exist; falls back to the labeled demo dataset (`isDemo: true` in the response) only when none do. |
| `GET` | `/api/projects/:id` | Single project, including its AI-computed `riskScore` and `anomalies[]`. |

</details>

<details>
<summary><b>Dashboard, Timeline, Map, Activity</b></summary>

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Aggregate stats: document/report totals, status/type breakdowns, avg. risk/confidence, plus a `projects` block (status/state/department rollups, average risk score, 5 most recent projects). |
| `GET` | `/api/timeline/:id` | Report timeline/progress + chronological audit-log events for one document. |
| `GET` | `/api/projects/map` | Map points merged from AI-analyzed documents and geocoded government-data projects, with a computed `risk` tier (`low`/`medium`/`high`) and `health` score. Same demo-fallback rule as `/api/projects`. |
| `GET` | `/api/activity/live?limit=20` | Newest-first audit events — document uploads/analyses, AI anomaly findings, and government-data sync runs — with a human-readable title and derived severity. |
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
# Project-Sentinel-AI-Integrity
