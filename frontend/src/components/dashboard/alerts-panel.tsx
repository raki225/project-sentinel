import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAlerts } from "@/hooks/use-sentinel"
import { formatDate, riskTokens } from "@/utils/format"

export function AlertsPanel() {
  const { data, isLoading } = useAlerts()

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Urgent Alerts</CardTitle>
        {data && <span className="text-xs text-muted-foreground">{data.length} active</span>}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading || !data
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          : data.map((alert, i) => {
              const tokens = riskTokens[alert.riskLevel]
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  <Link
                    to="/insights/$projectId"
                    params={{ projectId: alert.projectId }}
                    className="group flex items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:border-accent/40 hover:bg-accent-soft/40"
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tokens.bg}`}>
                      <AlertTriangle className={`h-4 w-4 ${tokens.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{alert.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{alert.description}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">{formatDate(alert.createdAt)}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </motion.div>
              )
            })}
      </CardContent>
    </Card>
  )
}
