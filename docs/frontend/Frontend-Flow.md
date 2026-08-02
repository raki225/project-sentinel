# Frontend Flow

End-to-end trace of how data reaches the screen, page by page, after this refactor.

## Live map / activity feed (any page that embeds them: `/`, `/reports`)

```
ProjectMap mounts
  → useProjectsMap() [TanStack Query]
    → projectsApi.map() [lib/sdk/projectsApi.ts]
      → apiRequest("/projects/map", projectsMapResponseSchema) [lib/api-client.ts]
        → fetch(`${NEXT_PUBLIC_API_URL}/projects/map`)
        → Zod-validates the response shape
        → returns ApiResult<ProjectsMapResponse>
  ← query.isPending / query.isError / query.data drive the loading/error/ready JSX (unchanged markup)
  ← if points.length === 0 (no real geocoded data), falls back to DEMO_PROJECT_MAP_POINTS — same as before
```

`LiveActivityFeed` is identical, swapping in `useLiveActivity(8)` → `activityApi.live(8)`, polling every 10s via
`refetchInterval` instead of a hand-rolled `setInterval`.

## `/projects` and Overview's project grid

```
useProjectRegistry() [hooks/useProjectRegistry.ts]
  → useProjects({ limit: 100 }) → GET /api/projects
  ← backend reports isDemo: true|false
     if true  → render lib/sentinel-data.ts's PROJECTS directly (full-fidelity demo set, unchanged visual output)
     if false → render query.data.projects.map(adaptBackendProject) (lib/adapters/projectAdapter.ts)
                  real fields pass through directly; decorative fields (category/phase/milestones/image/stage)
                  are honest, disclosed derivations — never invented specifics (see Architecture.md §12)
  ← same client-side filter/search/sort logic as before, now closing over the fetched array instead of a static import
```

Today, in practice: no government dataset has been configured on the backend yet, so `isDemo` is always `true` and
these pages render **exactly** what they rendered before this refactor. The backend-first path only diverges once
a real dataset is synced (see the government-data-ingestion work in `Backend/src/ingestion/`).

## `/workspace`

```
URL has ?project=<id> (or doesn't, on first visit)
  → useProjectRegistry() supplies the full project list
  → selected project = projects.find(id === requestedId) ?? projects[0]
  → useEffect adopts the resolved project into the URL if it wasn't already there
     (so a bookmark/refresh always lands back on the same project)
  → ProjectSwitcher lets you pick a different one → router.push(new ?project=id) → re-selects, re-renders tabs
  → the 6 tabs (Overview/Documents/Money Journey/AI Verification/Reports/Citizen View) render exactly as before —
    still local/derived-from-mock, since no backend endpoint exists for any of that data yet
```

## What's genuinely backend-driven today vs. what isn't

| Live (real fetch, real error/loading states) | Still local/mock (no backend endpoint exists) |
|---|---|
| Live map | Workspace: Documents, Money Journey, AI Verification, Reports, Citizen View tabs |
| Live activity feed | `/verification` (scripted demo) |
| `/projects`, Overview grid, Workspace project list (backend-first, demo fallback) | `/explorer` (static ledger) |
| | `/citizen` issue-report submission |

See `docs/architecture/BACKEND_V2_ARCHITECTURE.md` for what backend work would be required to close the right-hand
column.
