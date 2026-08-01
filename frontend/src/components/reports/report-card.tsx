import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { FileText } from "lucide-react"
import type { Report } from "@/types"
import { RiskBadge } from "@/components/common/risk-badge"
import { getProject } from "@/data/mock"
import { formatDate } from "@/utils/format"
import { cn } from "@/lib/utils"

const STATUS_STYLE: Record<Report["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  final: "bg-success/10 text-success",
  flagged: "bg-danger/10 text-danger",
}

export function ReportCard({ report, index }: { report: Report; index: number }) {
  const project = getProject(report.projectId)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
    >
      <Link
        to="/reports/$id"
        params={{ id: report.id }}
        className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium capitalize", STATUS_STYLE[report.status])}>
            {report.status}
          </span>
        </div>
        <p className="mt-4 text-sm font-semibold leading-snug">{report.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{project?.name}</p>
        <p className="mt-2.5 line-clamp-2 text-sm text-muted-foreground">{report.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-[11px] text-muted-foreground">{formatDate(report.createdAt)} · {report.pages}p</span>
          <RiskBadge level={report.riskLevel} />
        </div>
      </Link>
    </motion.div>
  )
}
