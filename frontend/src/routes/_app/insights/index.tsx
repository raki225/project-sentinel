import { createFileRoute } from "@tanstack/react-router"
import { PageHeader } from "@/components/common/page-header"
import { InsightCard } from "@/components/insights/insight-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useInsights } from "@/hooks/use-sentinel"

export const Route = createFileRoute("/_app/insights/")({
  component: InsightsIndexPage,
})

function InsightsIndexPage() {
  const { data, isLoading } = useInsights()

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader
        title="AI Insights"
        description="Every finding is evidence-grounded — expand any insight to trace the full reasoning chain."
      />

      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((insight, i) => (
            <InsightCard key={insight.id} insight={insight} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
