# Developer Guide

Practical guide for extending the frontend after this refactor. Read `Architecture.md` first if you haven't — it
explains *why* things are shaped this way, not just *how*.

## Adding a page that reads real backend data

1. If the endpoint doesn't exist yet: check `docs/architecture/BACKEND_V2_ARCHITECTURE.md` for the design, or add
   one following the existing backend's `controller → route` pattern.
2. Add a Zod schema + type to `types/<domain>.ts` matching the endpoint's response shape exactly.
3. Add a function to `lib/sdk/<domain>Api.ts` (new file if it's a new domain — register it in `lib/sdk/index.ts`).
4. Add a hook in `hooks/use<Thing>.ts`:
   ```ts
   "use client"
   import { useQuery } from "@tanstack/react-query"
   import { xApi } from "@/lib/sdk"
   import type { XResponse } from "@/types/x"
   import type { ApiErrorInfo } from "@/types/api"

   export function useX() {
     return useQuery<XResponse, ApiErrorInfo>({
       queryKey: ["x"],
       queryFn: async () => {
         const result = await xApi.get()
         if (!result.ok) throw result.error
         return result.data
       },
     })
   }
   ```
5. In the component: `const query = useX()`, then branch on `query.isPending` / `query.isError` / `query.data` —
   same three-state pattern every existing hook consumer uses (see `project-map.tsx` for the reference example).
   Use `query.error?.message` for error copy (already contextual, not "Failed") and `query.refetch()` for retry.

## Don't

- Don't call `fetch()` directly in a component. Go through a hook.
- Don't put a Zod schema inline in a component or SDK file — it belongs in `types/`.
- Don't invent fields on adapted backend data. If a real field doesn't exist, either extend the backend schema (if
  you own that decision) or render a graceful "not available" state — see `lib/adapters/projectAdapter.ts`'s
  comments for the standard this codebase holds to.
- Don't add a new global store for server data. TanStack Query is already the cache — a second cache is a bug
  waiting to happen (stale duplicate state).
- Don't update router/search-param state during render. Always inside a `useEffect` — see the bug this refactor
  caught and fixed in `app/workspace/page.tsx` (React warns "Cannot update a component while rendering a different
  component" when you get this wrong; that warning is not cosmetic, it indicates a real state-tearing risk).

## Testing a change didn't break the UI

There's no automated visual regression suite (or any test suite — see `Architecture.md`, none exists in this repo
today). Until one exists, verify manually:
```bash
cd Backend && npm run build && node dist/server.js &
cd frontend && npm run dev &
```
then drive it with Playwright/`chromium-cli` (see the repo-level `run` skill guidance) — navigate, screenshot,
check `console --errors`. This refactor was verified exactly this way; screenshots and a real caught bug (the
router-during-render issue above) came from that process, not from "the build succeeded" alone. A green build only
proves the types line up — it does not prove the page renders or that nothing throws at runtime.

## Known gaps (intentionally not closed in this pass)

See `Architecture.md` §12 for the full reasoning. Short version: Workspace's tab content, `/verification`,
`/explorer`, and citizen issue-reporting all need real backend endpoints before they can be honestly wired up —
building frontend code against endpoints that don't exist would be worse than the current, clearly-scoped
simulation. The `features/` folder reorganization was deferred as high-risk/low-value relative to everything else
in this pass.
