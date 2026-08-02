# API Integration

How the frontend talks to the backend, end to end. See `Architecture.md` for the audit that motivated this design.

## The layers

```
Component
  └─ hook (hooks/useX.ts)              — TanStack Query wrapper, throw-based
       └─ SDK module (lib/sdk/xApi.ts) — one function per endpoint, returns ApiResult<T>
            └─ apiRequest() (lib/api-client.ts) — fetch + timeout + Zod validation, never throws
                 └─ backend (NEXT_PUBLIC_API_URL)
```

- **`lib/api-client.ts`** — the only place `fetch()` is called. Handles: offline detection
  (`navigator.onLine`), request timeout (`AbortController`, 15s default), HTTP status → `ApiErrorKind` mapping
  (401→unauthorized, 403→forbidden, 404→not_found, 5xx→server), and Zod schema validation of the parsed JSON body.
  Never throws — always resolves to `ApiResult<T>` (`{ ok: true, data } | { ok: false, error }`).
- **`lib/sdk/*Api.ts`** — one module per backend resource (`projectsApi`, `documentsApi`, `activityApi`,
  `dashboardApi`, `reportsApi`), each just a thin set of `apiRequest(path, schema, options)` calls with the right
  URL and Zod schema. This is the "SDK" the refactor prompt asked for.
- **`hooks/use*.ts`** — TanStack Query wrappers. This is the one deliberate seam where the `ApiResult` convention
  is adapted into react-query's throw-based convention (`if (!result.ok) throw result.error`), because that's how
  react-query populates `.error`/`.isError`. Every hook explicitly types `useQuery<TData, ApiErrorInfo>` so
  `query.error` is fully typed, not just `Error`.
- **`lib/api.ts`** — compatibility barrel. Every existing import of `"@/lib/api"` still works: it re-exports the
  SDK objects, all shared types, `API_BASE_URL`, and legacy throw-based wrapper functions
  (`getProjectsMap`, `getLiveActivity`, `getReport`, `listDocuments`) for any code not yet migrated to hooks.

## Adding a new endpoint

1. Add/extend a Zod schema + inferred type in `types/<domain>.ts`.
2. Add a function to the matching `lib/sdk/<domain>Api.ts` module (or a new module + register it in
   `lib/sdk/index.ts`).
3. Add a hook in `hooks/use<Thing>.ts` following the existing pattern (see any file in `hooks/` — they're all
   ~15 lines and near-identical).
4. Use the hook in a component. Never call `fetch` or import an SDK module directly from a component.

## Current endpoint coverage

| Endpoint | SDK | Hook | Status |
|---|---|---|---|
| `GET /api/projects` | `projectsApi.list` | `useProjects`, `useProjectRegistry` | Live |
| `GET /api/projects/:id` | `projectsApi.getById` | `useProject` | Live |
| `GET /api/projects/map` | `projectsApi.map` | `useProjectsMap` | Live |
| `GET /api/activity/live` | `activityApi.live` | `useLiveActivity` | Live |
| `GET /api/dashboard` | `dashboardApi.get` | `useDashboard` | Live, not yet consumed by a page |
| `GET /api/documents` | `documentsApi.list` | — | SDK ready, no hook/consumer yet |
| `GET /api/report/:id` | `reportsApi.getByDocumentId` | — | SDK ready, no hook/consumer yet |

Everything in Workspace's Documents/Money Journey/AI Verification/Reports/Citizen View tabs, `/verification`, and
`/explorer` has **no backend endpoint at all** yet — see `Architecture.md` §12 for why those weren't wired in this
pass, and `docs/architecture/BACKEND_V2_ARCHITECTURE.md` for the design of what those endpoints would look like.

## Error handling contract

Every `ApiErrorInfo.kind` maps to specific, contextual copy via `describeApiError()` in `lib/api-client.ts` —
`offline`/`timeout`/`network`/`unauthorized`/`forbidden`/`not_found`/`server`/`invalid_response`/`unknown`, each
with its own user-facing sentence. Components read `query.error?.message` (which is already this contextual text,
not "Failed") and render a retry button wired to `query.refetch()`.

## Caching behavior

`providers/query-provider.tsx` sets the defaults every query inherits: `staleTime: 30_000` (30s — data is
considered fresh for that long, so navigating between pages that share a query doesn't always refetch),
`retry: 1` (one retry before surfacing an error — fails fast rather than hanging), `refetchOnWindowFocus: false`.
`useLiveActivity` overrides with `refetchInterval: 10_000` to preserve the original polling behavior. Request
deduplication, background refetch, and manual invalidation (`query.refetch()`) all come from TanStack Query itself
— none of it is hand-rolled.
