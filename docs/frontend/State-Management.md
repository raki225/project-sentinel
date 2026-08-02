# State Management

## What exists

There is still no global client-state store (no Context/Redux/Zustand for app-wide UI state) — that remains true
after this refactor, deliberately. The three kinds of state in this app:

1. **Server state** (anything that came from the backend) — now owned by **TanStack Query**
   (`providers/query-provider.tsx` + `hooks/use*.ts`). This replaces the old pattern of each component hand-rolling
   its own `useState<T[]>` + `useEffect` + manual `fetch`. Server state is cached, deduplicated, and shared across
   components automatically by query key — e.g. if two components both call `useProjects({ limit: 100 })`, only
   one request fires.
2. **URL state** — used for exactly one thing so far: Workspace's selected project (`?project=<id>`), via
   `next/navigation`'s `useSearchParams`/`useRouter`. This is what makes project selection survive a refresh
   without needing any client-side persistence (localStorage, a store, etc.) — the URL *is* the persistence.
3. **Local component state** (`useState`) — everything else: filter/search/sort inputs, tab selection, modal open/
   closed, upload-simulation progress, canvas pan/zoom. This was already the dominant pattern before the refactor
   and remains so; it's the correct choice for state that's genuinely local to one component's rendering.

## Why no global store was added

Nothing in this refactor needed one. Server state doesn't belong in a global client store once you have a query
cache — that's exactly the class of problem TanStack Query solves, and duplicating it in Context/Redux would just
be two sources of truth for the same data. The one piece of cross-page state (Workspace's selected project) is
better served by the URL than a store, because a URL is shareable, bookmarkable, and survives a hard refresh for
free. If a genuine need for shared client-only UI state emerges (e.g. a persistent sidebar-collapsed preference),
add a small dedicated Context for that specific concern — don't reach for a general-purpose global store
speculatively.

## Prop drilling

Mostly unchanged from before (see `Architecture.md` §4) — most "shared" data was and is imported directly into
whatever component needs it rather than threaded through props, which avoids drilling at the cost of tight
coupling to the data-source module. The one place this refactor changed that: `ProjectSwitcher` (in
`app/workspace/page.tsx`) now receives `projects` as a prop from its parent instead of importing `PROJECTS` from
`lib/sentinel-data.ts` directly — because the parent now sources that list from `useProjectRegistry()`, and the
switcher needs whatever the parent actually has (real or demo), not always the static mock array.

## Rerender behavior with query data

TanStack Query returns referentially stable data between renders when the underlying data hasn't changed (it does
a structural comparison, not just object identity, on refetch) — so `useMemo`/`useState` derived from query data
(e.g. `/projects`'s `filtered` list) don't get invalidated unnecessarily just because a background refetch
happened and returned the same JSON.
