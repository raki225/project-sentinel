import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { ArrowLeft, Download, Printer, Share2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/common/page-header"
import { RiskBadge } from "@/components/common/risk-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EvidenceCard } from "@/components/insights/evidence-card"
import { TimelineItem } from "@/components/timeline/timeline-item"
import { useReport, useTimelineForProject } from "@/hooks/use-sentinel"
import { evidenceByProject, getProject } from "@/data/mock"
import { formatDate } from "@/utils/format"

export const Route = createFileRoute("/_app/reports/$id")({
  component: ReportDetailPage,
})

function ReportDetailPage() {
  const { id } = Route.useParams()
  const { data: report, isLoading, isError } = useReport(id)
  const { data: timeline } = useTimelineForProject(report?.projectId)

  if (isError) throw notFound()

  const project = report ? getProject(report.projectId) : undefined
  const evidence = report ? (evidenceByProject[report.projectId] ?? []) : []

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground">
        <Link to="/reports">
          <ArrowLeft className="h-3.5 w-3.5" />
          All Reports
        </Link>
      </Button>

      {isLoading || !report ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <>
          <PageHeader
            title={report.title}
            description={`${project?.name ?? report.projectId} · Filed by ${report.author} · ${formatDate(report.createdAt)}`}
            actions={
              <div className="flex items-center gap-2">
                <RiskBadge level={report.riskLevel} />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => toast.success("Preparing PDF export...")}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => toast.success("Share link copied to clipboard")}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
              </div>
            }
          />

          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="evidence">Evidence ({evidence.length})</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Risk Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="mt-1 text-sm font-medium capitalize">{report.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pages</p>
                      <p className="mt-1 text-sm font-medium">{report.pages}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">District</p>
                      <p className="mt-1 text-sm font-medium">{project?.district ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contractor</p>
                      <p className="mt-1 text-sm font-medium">{project?.contractor ?? "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-3">
              {evidence.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No evidence attached to this report.</p>
              ) : (
                evidence.map((item, i) => <EvidenceCard key={item.id} evidence={item} index={i} />)
              )}
            </TabsContent>

            <TabsContent value="timeline">
              <Card>
                <CardContent className="pt-6">
                  {!timeline || timeline.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">No timeline events recorded yet.</p>
                  ) : (
                    timeline.map((event, i) => (
                      <TimelineItem
                        key={event.id}
                        event={event}
                        evidence={evidence}
                        index={i}
                        isLast={i === timeline.length - 1}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
