import { motion } from "framer-motion"
import { Lightbulb, Sparkles } from "lucide-react"
import type { AIInsight } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfidenceMeter } from "@/components/common/confidence-meter"
import { RiskBadge } from "@/components/common/risk-badge"
import { formatDateTime } from "@/utils/format"

export function AiSummaryPanel({ insight }: { insight: AIInsight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <CardTitle className="text-base">Sentinel Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <RiskBadge level={insight.riskLevel} />
            <span className="text-[11px] text-muted-foreground">{formatDateTime(insight.generatedAt)}</span>
          </div>

          <div className="flex justify-center border-y border-border py-5">
            <ConfidenceMeter value={insight.confidence} size={112} strokeWidth={9} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Summary</p>
            <p className="mt-1.5 text-sm leading-relaxed">{insight.summary}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {insight.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent/30 bg-accent-soft/40">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">Recommendation</p>
              <p className="mt-1 text-sm leading-relaxed">{insight.recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
