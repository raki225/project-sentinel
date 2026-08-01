import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { riskDistribution } from "@/data/mock"

const COLORS: Record<string, string> = {
  low: "var(--chart-2)",
  medium: "var(--chart-3)",
  high: "var(--chart-4)",
  critical: "#991b1b",
}

export function RiskPieChart() {
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={riskDistribution}
            dataKey="value"
            nameKey="name"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={3}
            strokeWidth={0}
          >
            {riskDistribution.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2.5">
        {riskDistribution.map((entry) => (
          <div key={entry.key} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[entry.key] }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
