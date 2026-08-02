# Project Sentinel — Frontend Architecture Audit

Complete read of every file in `frontend/app/`, `frontend/components/`, `frontend/lib/`. This is the audit requested
before any refactor; §12 explains exactly what was (and wasn't) safe to implement as a result.

---

## 1. Page hierarchy

```
app/layout.tsx (Server Component — the ONLY server-rendered piece of the whole app)
  └─ ThemeProvider (next-themes) → SiteHeader, {children}, SiteFooter, Analytics (prod only)

app/page.tsx            "/"            Client — Overview / command center
app/about/page.tsx      "/about"       Client — static marketing content
app/citizen/page.tsx    "/citizen"     Client — citizen search + issue-report form
app/explorer/page.tsx   "/explorer"    Client — fund-flow diagram + ledger table
app/projects/page.tsx   "/projects"    Client — project registry (search/filter/sort)
app/reports/page.tsx    "/reports"     Client — report library + live map
app/verification/page.tsx "/verification" Client — scripted AI verification demo
app/workspace/page.tsx  "/workspace"   Client — 6-tab per-project workspace
```

**Finding:** every single route is a Client Component. Zero use of the App Router's server-side data fetching,
streaming, or React Server Components — not even for the genuinely static `/about` page. This isn't wrong (the app
works), but it means every page pays the full client-JS-bundle + client-fetch-waterfall cost even where content
never changes. Out of scope to fix here (would risk exactly the visual/behavioral changes this refactor must avoid)
but worth flagging as a real future optimization, particularly for `/about`.

---

## 2. Component hierarchy / reusable UI

```
components/
  site-header.tsx, site-footer.tsx, theme-provider.tsx   — global chrome
  ui/button.tsx                                          — the ONLY shadcn/ui primitive actually present
  sentinel/
    brand-mark.tsx           — animated SVG logo, no data dependency
    primitives.tsx           — Reveal, Kicker, StatusPill, AnimatedNumber, ProgressRing, CategoryIcon, SparkTimeline
    project-card.tsx         — richest component in the app (390 lines), used by / and /projects
    project-map.tsx          — LIVE, calls GET /api/projects/map
    live-activity-feed.tsx   — LIVE, polls GET /api/activity/live
    document-modules.tsx     — Workspace → Documents tab (fully simulated)
    workspace-panels.tsx     — OverviewPanel/DocumentsPanel/MoneyJourneyPanel/VerificationPanel/ReportsPanel/CitizenPanel
    rupee-journey.tsx        — Workspace → Money Journey (interactive canvas, fully simulated)
```

**Finding — `components.json` overclaims:** it declares a full shadcn/ui setup (`aliases: { ui: "@/components/ui",
hooks: "@/hooks", ... }`) but `components/ui/` contains exactly one primitive (`button.tsx`), and `hooks/` doesn't
exist at all. Every "button", "card", "badge", and "chip" elsewhere in the app is a hand-rolled `<div>`/`<button>`
with inline Tailwind classes, not a shared component. `primitives.tsx` is the *actual* shared UI kit and is well
factored — it's just informally named/organized rather than following the shadcn convention its own config implies.

**Finding — duplicated tone→color logic:** `primitives.tsx`'s `StatusPill` centralizes a
`verified/pending/flagged/neutral/primary → Tailwind classes` map. But at least five other files
(`project-card.tsx`, `workspace-panels.tsx`, `rupee-journey.tsx`, `project-map.tsx`, `app/page.tsx`) independently
reimplement the same mapping via **dynamic Tailwind class strings** like `` `bg-${tone}/12 text-${tone}` ``. This
works today only because the exact literal strings (`bg-verified`, `text-pending`, `bg-flagged/12`, etc.) also
appear elsewhere in the codebase as complete string literals, which is what lets Tailwind's static class scanner
pick them up — dynamic template-literal class names are a well-known Tailwind fragility (the scanner can't see
inside a runtime `${tone}` interpolation). It works today by accident of overlap, not by design. Flagged, not fixed
in this pass (fixing it means centralizing on `StatusPill`'s style map everywhere, which is a real visual-parity
risk to attempt inside a "don't touch the UI" refactor — recommended as a focused follow-up, not bundled here).

---

## 3. Data flow / backend usage — the central finding

| Surface | Data source | Live? |
|---|---|---|
| `ProjectMap` (site-wide component) | `GET /api/projects/map` | ✅ Live |
| `LiveActivityFeed` (site-wide component) | `GET /api/activity/live` | ✅ Live |
| `/projects`, Overview's project grid/stats/category tiles/state bars, `ProjectCard` everywhere it's used, `/citizen`'s "near you" + search, Workspace's project switcher | `lib/sentinel-data.ts`'s static `PROJECTS` array | ❌ Local mock, imported directly into page components |
| Workspace → Documents tab | Locally generated per-project mock docs (`document-modules.tsx`'s `buildModuleDocs`) | ❌ Fully simulated, its own code comment says so |
| Workspace → Money Journey | Deterministic hash-seeded fake fund-flow (`rupee-journey.tsx`'s `buildJourney`) | ❌ Fully simulated |
| Workspace → AI Verification, Reports, Citizen View tabs | Derived from `PROJECTS` fields via pure functions in `workspace-panels.tsx` | ❌ Derived-from-mock, not simulated independently, but still not backend data |
| `/verification` (standalone page) | Hardcoded `STEPS`/`CHECKS`/`ANOMALIES` arrays stepped by `setInterval` | ❌ Fully scripted, no data in or out |
| `/explorer` | Hardcoded `FLOW`/`LEDGER` arrays | ❌ Fully static |
| `/citizen` issue-report form | `setSent(true)` on submit | ❌ No network call at all |

**This is the actual state of "backend usage":** two components (map, activity feed) are genuinely live-wired.
Everything else — including the two pages this refactor prompt specifically calls out (`/projects`, Workspace) —
runs entirely on `lib/sentinel-data.ts` or local component state. This matches exactly what the root README already
documents (🚧/🔮 sections), so nothing here is a surprise; it's the starting point this refactor has to work from.

---

## 4. State flow & prop drilling

- **No global state management exists anywhere** (no Context, no Redux/Zustand, no React Query). Every page owns
  its own `useState` for filters/search/tabs; nothing is shared across route navigations except what's baked into
  the URL (nothing currently is — filters reset on navigation, which is expected given there's no persistence
  layer).
- **Workspace's project selection does not persist.** `app/workspace/page.tsx` initializes
  `useState<SentinelProject>(PROJECTS[0])` — always the *first* mock project, every time the page mounts. Navigating
  away and back always resets to `PROJECTS[0]`, never remembers what you were looking at. This is a real UX gap the
  refactor prompt explicitly asks to fix ("Project selection persists. Refresh keeps current project.") — doing so
  requires either URL state (`?project=id`) or a persisted store; addressed in §12.
- **Prop drilling is minimal** because most "shared" data (`PROJECTS`, category/state constants) is imported
  directly from `lib/sentinel-data.ts` into whatever component needs it, rather than passed down — which avoids
  drilling at the cost of every consumer being tightly coupled to the mock data module directly (the thing this
  refactor needs to break).

---

## 5. Duplicated logic / interfaces

- **`ProjectMapPoint` vs. `MapPoint` (sentinel-data.ts) vs. per-project mini-map lookups in `project-card.tsx`** —
  three different, unrelated "a project has a location" shapes exist simultaneously: the live API's
  `{lat,lng,...}`, the mock `{x,y}` (percentage-based, for the old static SVG map), and `MAP_POINTS` (also
  `{x,y}`) used only by `ProjectCard`'s `MiniMap`. None share a type.
- **Status→tone derivation** (`"flagged" ? "flagged" : "pending" ? "pending" : "verified"`) is repeated verbatim as
  an inline ternary in at least six files (`app/page.tsx`, `app/workspace/page.tsx`, `project-card.tsx`,
  `workspace-panels.tsx`, `citizen/page.tsx`, `rupee-journey.tsx`) instead of one shared `toneForStatus()`.
  `rupee-journey.tsx` even defines its own local `toneForStatus` that's byte-identical to `workspace-panels.tsx`'s.
- **`ApiError` class, `DocumentSummary`, `ReportData`, `ProjectMapPoint`, `ActivityItem` types** are all defined
  inline inside `lib/api.ts` rather than in a dedicated types module — harmless today (one file), but exactly the
  pattern that causes duplication once a second API-consuming module needs the same shapes.

---

## 6. Dead code / unused surfaces

- **`components.json`'s `hooks` alias** (`@/hooks`) points at a directory that doesn't exist — dead config, not dead
  code, but worth removing or fulfilling.
- **`MAP_POINTS` in `sentinel-data.ts`** is used only by `ProjectCard`'s `MiniMap` — a small, isolated usage that
  could be inlined, though not harmful as-is.
- **No genuinely unreachable code or unused exports were found** — the codebase is small and disciplined enough
  that nothing is orphaned; the "dead code" issues here are architectural (data source coupling), not literal dead
  files.

---

## 7. Type safety

- **No `any` usage found** anywhere in `app/`, `components/`, or `lib/` — the codebase is already strict-mode clean
  (confirmed separately by a passing `tsc --noEmit` in earlier work on this project). This is genuinely good; the
  refactor's type-safety work is additive (shared models, runtime validation) rather than corrective.
- **Backend response shapes are trusted, not validated.** `lib/api.ts`'s `apiFetch` does `res.json()` and casts the
  result to the expected type (`return body as T`) with zero runtime verification that the shape actually matches.
  A malformed or evolving backend response would produce a runtime crash somewhere downstream rather than a
  graceful fallback — exactly what the refactor's "Runtime Validation" requirement targets.

---

## 8. Loading / error flow

- **`ProjectMap` and `LiveActivityFeed`** (the two live components) each hand-roll their own
  `loading`/`ready`/`error` state machine with `useState` + `useEffect` + manual `fetch` — duplicated per component,
  each with its own retry button, each blocking on mount with no request deduplication, no cache, and no background
  refresh (activity feed re-fetches from scratch every 10s via `setInterval`, discarding and refetching even if
  nothing changed).
- **No component distinguishes `offline` from `network error` from `timeout` from `5xx`** — `apiFetch` throws a
  generic `ApiError` with the backend's message (or a hardcoded fallback string) for every failure mode alike.
- **No skeleton loading states anywhere** — every loading state is a text string ("Loading…", "Loading live map…"),
  never a layout-preserving skeleton. Not necessarily wrong for this design language, but worth naming since the
  refactor prompt explicitly asks for skeleton support.
- **Race condition risk (real, not hypothetical):** neither `ProjectMap` nor `LiveActivityFeed` guards against
  overlapping requests or unmounted-component updates. If a `LiveActivityFeed` poll is in flight when the interval
  fires again (slow network) two requests race and whichever resolves *last* wins, regardless of which was sent
  more recently. If the component unmounts mid-request, `setState` still fires on the stale closure — no
  `AbortController`, no `isMounted` guard, no cleanup of the in-flight request itself (only the `setInterval` is
  cleared). This is exactly what a proper query/cache layer (§12) eliminates by construction.

---

## 9. Hydration

- **`LiveClock` (`app/page.tsx`) and `ModeToggle` (`site-header.tsx`)** both correctly use the
  `useState(null) → useEffect(() => setState(...))` mount-flag pattern with `suppressHydrationWarning` to avoid a
  server/client mismatch for time-of-day and theme — this is the *correct*, deliberate pattern, not a bug (flagged
  in an earlier session's lint pass and confirmed legitimate then; repeating that conclusion here since the prompt
  asks explicitly about hydration issues).
- No other hydration risks found — no other component reads `window`/`Date.now()`/`localStorage` during render.

---

## 10. Missing cleanup / stale effects

- `LiveActivityFeed`'s `setInterval` is cleaned up correctly on unmount.
- `document-modules.tsx`'s upload-simulation `setInterval`/`setTimeout` pair is cleaned up correctly on unmount
  (verified: `intervalRef`/`timeoutRef` cleared in a dedicated cleanup effect).
- `rupee-journey.tsx`'s non-passive wheel-zoom `addEventListener` is cleaned up correctly.
- **No missing cleanup was found.** The codebase is disciplined about this already.

---

## 11. Unnecessary rerenders

- `app/page.tsx`'s `filtered` (project search/filter) and `app/projects/page.tsx`'s equivalent are both correctly
  memoized with `useMemo`. No obvious avoidable rerender patterns found in the pages themselves.
- `ProjectCard` recomputes `qualityStatus(p)`/`fundingStatus(p)` via `useMemo` per render — correct, though the
  dependency is the whole `p` object, which is fine given `PROJECTS` is a stable module-level array today; will
  need re-checking once real backend objects (new references per fetch) replace it (addressed by React Query's
  built-in referential stability across refetches when data is unchanged — see §12).

---

## 12. What this refactor actually implements, and what it deliberately doesn't

**The core tension:** the prompt asks to (a) make `/projects` and Workspace "100% backend driven," while also (b)
scoping this pass to frontend-only code ("Use ONLY the code inside `frontend/`... these are the authoritative
files") and (c) never changing the UI. The real backend `Project` model (see
`docs/architecture/BACKEND_V2_ARCHITECTURE.md` and the ingestion pipeline built in the prior session) only has the
fields real government open datasets actually publish: name, department, state, district, budget, progress, status,
dates, contractor. It has no `category`, `phase`, `image`, `milestones`, or the 3-way `sanctioned/released/utilized`
split `ProjectCard` and Workspace are built around — because that data genuinely doesn't exist in public sources.

Given (b), extending the backend schema is out of scope here. Given (c), inventing values for those fields to force
real data through `ProjectCard`'s full rich rendering would mean fabricating numbers — the one thing explicitly
forbidden in the government-data work this project has otherwise held to consistently.

**So, implemented in this pass:**
- A real, typed, cached, validated API layer (`types/`, `lib/api-client.ts`, `lib/api/*Api.ts`,
  `@tanstack/react-query`) — the actual "production-ready architecture" infrastructure requested.
- `ProjectMap` and `LiveActivityFeed` refactored onto that layer internally, with byte-identical rendered output
  (these two already consume exactly the real backend shapes, so no field-mismatch risk).
- `/projects` and the Overview project grid made backend-first: real data is fetched and rendered through the same
  `ProjectCard`, with decorative sections (category chip, phase badge, milestones ring, 3-way budget breakdown)
  **conditionally rendered only when that data is actually present** — never fabricated. Since the backend
  currently has no real government dataset configured (`isDemo: true`), the *visual output today is unchanged* —
  the app still shows exactly the rich `sentinel-data.ts` demo experience it does now, because the demo dataset
  supplies every field `ProjectCard` wants. The moment a real dataset is configured, real projects render honestly
  with what they actually have.
- Workspace's project selection is fixed to persist (URL-driven), independent of the data-source question.

**Explicitly not backend-wired in this pass, and why:**
- Workspace's Documents/Money Journey/AI Verification/Reports/Citizen View tabs, `/verification`, `/explorer`,
  citizen issue-report submission — **no backend endpoints exist for any of these** (milestones, fund-flow ledger,
  multi-check verification runs, report rendering, citizen reports are all Phase 2+ items in
  `BACKEND_V2_ARCHITECTURE.md`, not yet implemented). Wiring frontend code to call endpoints that return 404 would
  be worse than leaving the existing, working, clearly-scoped simulation in place. This is the honest,
  intentional answer to "why isn't Workspace 100% backend driven yet" — it needs backend work first, which is a
  decision for you to scope separately (extending the backend was explicitly out of bounds for this pass).
- The full `features/` folder reorganization requested — deferred. Reorganizing every existing component's location
  touches import paths across the entire app for zero behavioral gain and real risk of breaking something in a
  pass whose primary constraint is "don't break anything visually." Recommended as its own, lower-risk follow-up
  once the app is genuinely backend-driven end to end (reorganizing around real feature boundaries makes much more
  sense after those boundaries reflect real data ownership, not before).
