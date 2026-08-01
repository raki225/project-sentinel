import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, Eye, GitMerge, Sparkles, TriangleAlert } from "lucide-react"
import type { ReasoningStep } from "@/types"
import { cn } from "@/lib/utils"
import { formatPercent } from "@/utils/format"

const KIND_META: Record<ReasoningStep["kind"], { icon: typeof Eye; color: string }> = {
  observation: { icon: Eye, color: "bg-slate-deep text-white" },
  correlation: { icon: GitMerge, color: "bg-accent text-white" },
  anomaly: { icon: TriangleAlert, color: "bg-warning text-white" },
  conclusion: { icon: Sparkles, color: "bg-success text-white" },
}

export function ReasoningChain({
  steps,
  onCiteHover,
}: {
  steps: ReasoningStep[]
  onCiteHover?: (evidenceId: string | null) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(steps[0]?.id ?? null)

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const meta = KIND_META[step.kind]
        const isOpen = expandedId === step.id
        const isLast = i === steps.length - 1
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="relative flex gap-4 pb-6"
          >
            {!isLast && <div className="absolute left-4 top-9 h-full w-px bg-border" />}
            <div className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", meta.color)}>
              <meta.icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
              <button
                onClick={() => setExpandedId(isOpen ? null : step.id)}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {step.kind}
                  </span>
                  <p className="mt-0.5 text-sm font-semibold">{step.title}</p>
                </div>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="mt-1 shrink-0 text-muted-foreground">
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
              </button>

              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.25 }}
                  className="mt-2 space-y-2.5 overflow-hidden"
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      Confidence: <span className="font-medium text-foreground">{formatPercent(step.confidence)}</span>
                    </span>
                    {step.citedEvidenceIds.map((id) => (
                      <a
                        key={id}
                        href={`#evidence-${id}`}
                        onMouseEnter={() => onCiteHover?.(id)}
                        onMouseLeave={() => onCiteHover?.(null)}
                        className="rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent hover:bg-accent hover:text-white"
                      >
                        {id}
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
