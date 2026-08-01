import { createFileRoute } from "@tanstack/react-router"
import { PageHeader } from "@/components/common/page-header"
import { KpiRow } from "@/components/dashboard/kpi-row"
import { DashboardCharts } from "@/components/dashboard/chart-cards"
import { AlertsPanel } from "@/components/dashboard/alerts-panel"
import { RecommendationsPanel } from "@/components/dashboard/recommendations-panel"
import { ProjectMap } from "@/components/dashboard/project-map"
import { ProjectsTable } from "@/components/dashboard/projects-table"

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <PageHeader
        title="Command Center"
        description="Real-time oversight across all sanctioned infrastructure projects."
      />
      <KpiRow />
      <DashboardCharts />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ProjectMap />
        <div className="grid grid-cols-1 gap-4 lg:col-span-2 sm:grid-cols-2">
          <AlertsPanel />
          <RecommendationsPanel />
        </div>
      </div>
      <ProjectsTable />
    </div>
  )
}
