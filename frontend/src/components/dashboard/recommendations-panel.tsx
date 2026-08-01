import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useInsights } from "@/hooks/use-sentinel"
import { getProject } from "@/data/mock"
import { formatPercent } from "@/utils/format"

export function RecommendationsPanel() {
  const { data, isLoading } = useInsights()

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <CardTitle className="text-base">Smart Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading || !data
          ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          : data.map((insight, i) => {
              const project = getProject(insight.projectId)
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                >
                  <Link
                    to="/insights/$projectId"
                    params={{ projectId: insight.projectId }}
                    className="block rounded-xl border border-border p-3.5 transition-colors hover:border-accent/40 hover:bg-accent-soft/40"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">{project?.name ?? insight.projectId}</p>
                      <span className="text-[11px] font-medium text-accent">
                        {formatPercent(insight.confidence)} confidence
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium leading-snug">{insight.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{insight.recommendation}</p>
                  </Link>
                </motion.div>
              )
            })}
      </CardContent>
    </Card>
  )
}
