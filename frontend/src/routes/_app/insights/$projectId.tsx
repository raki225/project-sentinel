import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { useState } from "react"
import { PageHeader } from "@/components/common/page-header"
import { RiskBadge } from "@/components/common/risk-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ReasoningChain } from "@/components/insights/reasoning-chain"
import { EvidenceCard } from "@/components/insights/evidence-card"
import { AiSummaryPanel } from "@/components/insights/ai-summary-panel"
import { useInsightsForProject, useProject } from "@/hooks/use-sentinel"
import { ArrowLeft } from "lucide-react"

export const Route = createFileRoute("/_app/insights/$projectId")({
  component: InsightDetailPage,
})

function InsightDetailPage() {
  const { projectId } = Route.useParams()
  const { data: project, isLoading: projectLoading } = useProject(projectId)
  const { data: insights, isLoading: insightsLoading } = useInsightsForProject(projectId)
  const [hovered, setHovered] = useState<string | null>(null)

  const isLoading = projectLoading || insightsLoading
  const insight = insights?.[0]

  if (!isLoading && !project) {
    throw notFound()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground">
        <Link to="/insights">
          <ArrowLeft className="h-3.5 w-3.5" />
          All Insights
        </Link>
      </Button>

      <PageHeader
        title={project?.name ?? "Loading..."}
        description={project ? `${project.district} · ${project.department}` : undefined}
        actions={project && <RiskBadge level={project.riskLevel} />}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : !insight ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <p className="text-sm font-medium">No AI findings for this project yet</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sentinel generates insights automatically once field evidence is uploaded and analyzed.
          </p>
          <Button asChild size="sm" className="mt-5">
            <Link to="/upload">Upload evidence</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs defaultValue="reasoning">
              <TabsList>
                <TabsTrigger value="reasoning">Reasoning Chain</TabsTrigger>
                <TabsTrigger value="evidence">Evidence ({insight.evidence.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="reasoning" className="rounded-2xl border border-border bg-card p-6">
                <ReasoningChain steps={insight.reasoning} onCiteHover={setHovered} />
              </TabsContent>
              <TabsContent value="evidence" className="space-y-3">
                {insight.evidence.map((item, i) => (
                  <EvidenceCard key={item.id} evidence={item} index={i} highlighted={hovered === item.id} />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:sticky lg:top-22 lg:self-start">
            <AiSummaryPanel insight={insight} />
          </div>
        </div>
      )}
    </div>
  )
}
