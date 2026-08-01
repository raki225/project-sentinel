import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { budgetTrend } from "@/data/mock"

export function BudgetAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={budgetTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="allocatedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="utilizedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickFormatter={(v) => `₹${v}Cr`}
          width={56}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 12,
          }}
          formatter={(value, name) => [`₹${value}Cr`, name === "allocated" ? "Allocated" : "Utilized"]}
        />
        <Area
          type="monotone"
          dataKey="allocated"
          stroke="var(--chart-5)"
          strokeWidth={2}
          fill="url(#allocatedGradient)"
        />
        <Area
          type="monotone"
          dataKey="utilized"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#utilizedGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
