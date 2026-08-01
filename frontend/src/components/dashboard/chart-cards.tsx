import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BudgetAreaChart } from "@/components/charts/budget-area-chart"
import { RiskPieChart } from "@/components/charts/risk-pie-chart"
import { InspectionsBarChart } from "@/components/charts/inspections-bar-chart"

function ChartCard({
  title,
  description,
  children,
  delay = 0,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  )
}

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ChartCard
        title="Budget: Allocated vs. Utilized"
        description="Cumulative across all active projects, ₹ crore"
        delay={0}
        className="lg:col-span-2"
      >
        <BudgetAreaChart />
      </ChartCard>
      <ChartCard title="Risk Distribution" description="Across 9 active projects" delay={0.05}>
        <RiskPieChart />
      </ChartCard>
      <ChartCard title="Inspections Conducted" description="Monthly, last 6 months" delay={0.1} className="lg:col-span-3">
        <InspectionsBarChart />
      </ChartCard>
    </div>
  )
}
