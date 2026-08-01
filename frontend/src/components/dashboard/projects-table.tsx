import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { Download, Search } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RiskBadge } from "@/components/common/risk-badge"
import { useProjects } from "@/hooks/use-sentinel"
import { formatCrore, formatPercent, statusTokens } from "@/utils/format"
import type { RiskLevel } from "@/types"

export function ProjectsTable() {
  const { data, isLoading } = useProjects()
  const [query, setQuery] = useState("")
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all")

  const filtered = useMemo(() => {
    if (!data) return []
    return data.filter((project) => {
      const matchesQuery =
        query.trim().length === 0 ||
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.district.toLowerCase().includes(query.toLowerCase())
      const matchesRisk = riskFilter === "all" || project.riskLevel === riskFilter
      return matchesQuery && matchesRisk
    })
  }, [data, query, riskFilter])

  return (
    <Card>
      <CardHeader className="flex-col items-start gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">All Projects</CardTitle>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects or districts..."
              className="w-full pl-8 sm:w-64"
            />
          </div>
          <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v as RiskLevel | "all")}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => toast.success("Export started", { description: "Your CSV will download shortly." })}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Budget Utilized</TableHead>
                  <TableHead>AI Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((project) => {
                  const status = statusTokens[project.status]
                  return (
                    <TableRow key={project.id} className="cursor-pointer">
                      <TableCell className="max-w-64">
                        <Link
                          to="/insights/$projectId"
                          params={{ projectId: project.id }}
                          className="block hover:text-accent"
                        >
                          <p className="truncate font-medium">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{project.id}</p>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{project.district}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <RiskBadge level={project.riskLevel} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-accent"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatCrore(project.budgetUtilized)}
                        <span className="text-muted-foreground"> / {formatCrore(project.budgetAllocated)}</span>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{formatPercent(project.aiConfidence)}</TableCell>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      No projects match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
