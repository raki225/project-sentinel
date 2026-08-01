import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import type { AIInsight } from "@/types"
import { RiskBadge } from "@/components/common/risk-badge"
import { getProject } from "@/data/mock"
import { formatDateTime, formatPercent } from "@/utils/format"

export function InsightCard({ insight, index }: { insight: AIInsight; index: number }) {
  const project = getProject(insight.projectId)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
    >
      <Link
        to="/insights/$projectId"
        params={{ projectId: insight.projectId }}
        className="block rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{project?.name ?? insight.projectId}</p>
              <p className="text-[11px] text-muted-foreground/70">{formatDateTime(insight.generatedAt)}</p>
            </div>
          </div>
          <RiskBadge level={insight.riskLevel} />
        </div>

        <p className="mt-4 text-base font-semibold leading-snug">{insight.title}</p>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{insight.summary}</p>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex flex-wrap gap-1.5">
            {insight.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
          <span className="text-xs font-medium text-accent">{formatPercent(insight.confidence)} confidence</span>
        </div>
      </Link>
    </motion.div>
  )
}
