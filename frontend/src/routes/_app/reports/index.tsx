import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { ReportCard } from "@/components/reports/report-card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useReports } from "@/hooks/use-sentinel"
import type { ReportStatus } from "@/types"

export const Route = createFileRoute("/_app/reports/")({
  component: ReportsIndexPage,
})

function ReportsIndexPage() {
  const { data, isLoading } = useReports()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<ReportStatus | "all">("all")

  const filtered = useMemo(() => {
    if (!data) return []
    return data.filter((report) => {
      const matchesQuery = report.title.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === "all" || report.status === status
      return matchesQuery && matchesStatus
    })
  }, [data, query, status])

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader
        title="Reports"
        description="AI-generated and field reports, ready for review, export, and sign-off."
        actions={
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reports..."
                className="w-56 pl-8"
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as ReportStatus | "all")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((report, i) => (
            <ReportCard key={report.id} report={report} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
