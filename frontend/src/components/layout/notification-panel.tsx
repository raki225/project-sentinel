import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { alerts } from "@/data/mock"
import { formatDate, riskTokens } from "@/utils/format"

export function NotificationPanel() {
  return (
    <div className="flex max-h-96 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">Alerts</p>
        <Badge variant="secondary" className="text-[10px]">
          {alerts.length} active
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {alerts.map((alert) => {
          const tokens = riskTokens[alert.riskLevel]
          return (
            <div key={alert.id} className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-0">
              <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tokens.bg}`}>
                <AlertTriangle className={`h-3.5 w-3.5 ${tokens.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">{alert.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{alert.description}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">{formatDate(alert.createdAt)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
