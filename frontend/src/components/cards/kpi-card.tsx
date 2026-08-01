import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { AnimatedCounter } from "@/components/common/animated-counter"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  label: string
  value: number
  format?: (value: number) => string
  icon: LucideIcon
  trend?: { value: string; positive: boolean }
  tone?: "default" | "danger" | "success"
  index?: number
}

export function KpiCard({ label, value, format, icon: Icon, trend, tone = "default", index = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            tone === "danger" && "bg-danger/10 text-danger",
            tone === "success" && "bg-success/10 text-success",
            tone === "default" && "bg-accent-soft text-accent",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-2xl font-semibold tracking-tight">
          <AnimatedCounter value={value} format={format} />
        </p>
        {trend && (
          <span className={cn("text-xs font-medium", trend.positive ? "text-success" : "text-danger")}>
            {trend.value}
          </span>
        )}
      </div>
    </motion.div>
  )
}
