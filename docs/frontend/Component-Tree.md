# Component Tree

```
app/layout.tsx  (Server Component)
├─ ThemeProvider (next-themes)
│  └─ QueryProvider ★ NEW — wraps everything below in a TanStack QueryClient
│     ├─ SiteHeader
│     ├─ {children}  — one of the 9 route pages below
│     └─ SiteFooter
└─ Analytics (Vercel, production only)

app/page.tsx "/"  (Overview)
├─ LiveClock (local)
├─ ProjectMap ★ REFACTORED — internals now use useProjectsMap(), JSX unchanged
├─ LiveActivityFeed ★ REFACTORED — internals now use useLiveActivity(), JSX unchanged
├─ project grid (inline cards, not <ProjectCard>) ★ DATA SOURCE CHANGED — now useProjectRegistry()
├─ category tiles, fund timeline (SparkTimeline), state bars — unchanged, still mock (FUND_TIMELINE/STATES/CATEGORIES)
└─ awaiting-verification / recently-verified / flagged lists ★ DATA SOURCE CHANGED

app/projects/page.tsx "/projects"
├─ toolbar (search/filters/sort) — unchanged
├─ Demo-mode banner ★ NEW — shown only when useProjectRegistry().isDemo
├─ loading/error states ★ NEW
└─ ProjectCard × N  ★ DATA SOURCE CHANGED — component itself untouched

app/workspace/page.tsx "/workspace"
└─ Suspense ★ NEW (required for useSearchParams)
   └─ WorkspacePageContent
      ├─ ProjectSwitcher ★ CHANGED — now takes `projects` as a prop instead of importing PROJECTS
      ├─ loading/error/empty states ★ NEW
      ├─ 6 tabs, each a panel from workspace-panels.tsx / document-modules.tsx / rupee-journey.tsx — all unchanged,
      │  still fully local/simulated (no backend endpoints exist for any of this — see Architecture.md §12)
      └─ URL-driven selected project (?project=id) ★ NEW — was useState(PROJECTS[0]), reset on every mount

app/verification, app/explorer, app/citizen, app/reports, app/about — unchanged this pass
(app/reports/page.tsx still embeds <ProjectMap>, which is refactored transitively)

components/sentinel/
├─ project-map.tsx        ★ REFACTORED internally, byte-identical JSX
├─ live-activity-feed.tsx ★ REFACTORED internally, byte-identical JSX
├─ project-card.tsx       ★ ONE LINE CHANGED — "Open workspace" href now carries ?project=<id>
├─ primitives.tsx         unchanged — Reveal/Kicker/StatusPill/AnimatedNumber/ProgressRing/CategoryIcon/SparkTimeline
├─ document-modules.tsx, workspace-panels.tsx, rupee-journey.tsx, brand-mark.tsx — unchanged
components/site-header.tsx, site-footer.tsx, theme-provider.tsx, ui/button.tsx — unchanged
```

## New infrastructure (not part of the render tree, but load-bearing)

```
types/            api.ts, project.ts, document.ts, report.ts, activity.ts, dashboard.ts — Zod schemas + inferred types
lib/api-client.ts apiRequest() — the one fetch() call site
lib/sdk/          projectsApi, documentsApi, activityApi, dashboardApi, reportsApi
lib/api.ts        compatibility barrel over lib/sdk/ + legacy throw-based wrappers
lib/adapters/     projectAdapter.ts — BackendProject → SentinelProject, honest field-by-field, see Architecture.md §12
hooks/            useProjects, useProject, useProjectsMap, useLiveActivity, useDashboard, useProjectRegistry
providers/        query-provider.tsx
```

## Not reorganized

The `features/` folder structure the refactor prompt requested (grouping `components/` by domain — projects,
workspace, dashboard, etc.) was **not** executed. See `Architecture.md` §12 for the reasoning: moving every
existing component's file location touches import paths across the whole app for zero behavioral change, which is
disproportionate risk for a pass whose primary constraint is visual/behavioral non-regression. The current
`components/sentinel/` flat structure is preserved.
