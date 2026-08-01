import { useState } from "react"
import { motion } from "framer-motion"
import {
  AlertCircle,
  Banknote,
  ChevronDown,
  ClipboardCheck,
  Flag,
  FileText,
  Sparkles,
} from "lucide-react"
import type { Evidence, TimelineEvent } from "@/types"
import { formatDate, riskTokens } from "@/utils/format"
import { RiskBadge } from "@/components/common/risk-badge"
import { cn } from "@/lib/utils"

const TYPE_META: Record<TimelineEvent["type"], { icon: typeof Flag; label: string; color: string }> = {
  milestone: { icon: Flag, label: "Milestone", color: "bg-accent text-white" },
  payment: { icon: Banknote, label: "Payment", color: "bg-slate-deep text-white" },
  inspection: { icon: ClipboardCheck, label: "Inspection", color: "bg-success text-white" },
  report: { icon: FileText, label: "Report", color: "bg-warning text-white" },
  complaint: { icon: AlertCircle, label: "Complaint", color: "bg-danger text-white" },
  ai_finding: { icon: Sparkles, label: "AI Finding", color: "bg-accent text-white" },
}

interface TimelineItemProps {
  event: TimelineEvent
  evidence: Evidence[]
  index: number
  isLast: boolean
}

export function TimelineItem({ event, evidence, index, isLast }: TimelineItemProps) {
  const [expanded, setExpanded] = useState(false)
  const meta = TYPE_META[event.type]
  const relatedEvidence = evidence.filter((e) => event.evidenceIds?.includes(e.id))

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex gap-4 pb-8"
    >
      {!isLast && <div className="absolute left-5 top-11 h-full w-px bg-border" />}

      <div className={cn("relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm", meta.color)}>
        <meta.icon className="h-4.5 w-4.5" />
      </div>

      <div className="flex-1 pt-0.5">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-start justify-between gap-3 text-left"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{meta.label}</span>
              <span className="text-xs text-muted-foreground/60">{formatDate(event.date)}</span>
            </div>
            <p className="mt-1 text-sm font-semibold">{event.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{event.description}</p>
            {event.riskLevel && <RiskBadge level={event.riskLevel} className="mt-2" />}
          </div>
          {relatedEvidence.length > 0 && (
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="mt-1 shrink-0 text-muted-foreground">
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          )}
        </button>

        {expanded && relatedEvidence.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.25 }}
            className="mt-3 space-y-2 overflow-hidden rounded-xl border border-border bg-muted/40 p-3"
          >
            {relatedEvidence.map((item) => (
              <div key={item.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{item.title}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                      riskTokens.medium.bg,
                      riskTokens.medium.color,
                    )}
                  >
                    {item.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.excerpt}</p>
                <p className="mt-1.5 text-[11px] text-muted-foreground/70">{item.source}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
