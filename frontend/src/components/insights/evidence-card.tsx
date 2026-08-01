import { motion } from "framer-motion"
import { Banknote, FileText, ImageIcon, MessageSquareWarning, ScrollText } from "lucide-react"
import type { Evidence } from "@/types"
import { formatDateTime } from "@/utils/format"
import { cn } from "@/lib/utils"

const TYPE_META: Record<Evidence["type"], { icon: typeof FileText; label: string }> = {
  document: { icon: ScrollText, label: "Document" },
  image: { icon: ImageIcon, label: "Image" },
  report: { icon: FileText, label: "Report" },
  complaint: { icon: MessageSquareWarning, label: "Complaint" },
  payment: { icon: Banknote, label: "Payment" },
}

export function EvidenceCard({ evidence, index, highlighted }: { evidence: Evidence; index: number; highlighted?: boolean }) {
  const meta = TYPE_META[evidence.type]
  return (
    <motion.div
      id={`evidence-${evidence.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "rounded-xl border p-4 transition-colors",
        highlighted ? "border-accent bg-accent-soft/50" : "border-border bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <meta.icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{evidence.title}</p>
            <p className="text-[11px] text-muted-foreground">{evidence.source}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {meta.label}
        </span>
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{evidence.excerpt}</p>
      <p className="mt-2 text-[11px] text-muted-foreground/60">{formatDateTime(evidence.timestamp)}</p>
    </motion.div>
  )
}
