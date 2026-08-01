import { AlertTriangle, Banknote, Building2, Gauge, ShieldCheck } from "lucide-react"
import { KpiCard } from "@/components/cards/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useKpis } from "@/hooks/use-sentinel"
import { formatCrore, formatPercent } from "@/utils/format"

export function KpiRow() {
  const { data, isLoading } = useKpis()

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard index={0} label="Active Projects" value={data.totalProjects} icon={Building2} />
      <KpiCard
        index={1}
        label="Budget Utilized"
        value={data.budgetUtilized / 1_00_00_000}
        format={(v) => formatCrore(v * 1_00_00_000)}
        icon={Banknote}
        trend={{ value: `of ${formatCrore(data.totalBudget)}`, positive: true }}
      />
      <KpiCard
        index={2}
        label="High Risk Projects"
        value={data.highRiskProjects}
        icon={AlertTriangle}
        tone="danger"
      />
      <KpiCard
        index={3}
        label="Avg. AI Confidence"
        value={data.avgAiConfidence * 100}
        format={(v) => formatPercent(v / 100)}
        icon={Gauge}
        tone="success"
      />
      <KpiCard index={4} label="Inspections (30d)" value={data.inspectionsThisMonth} icon={ShieldCheck} />
    </div>
  )
}
