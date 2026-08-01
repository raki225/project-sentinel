import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { PageHeader } from "@/components/common/page-header"
import { TimelineItem } from "@/components/timeline/timeline-item"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProjects, useTimelineForProject } from "@/hooks/use-sentinel"
import { evidenceByProject } from "@/data/mock"

export const Route = createFileRoute("/_app/timeline")({
  component: TimelinePage,
})

function TimelinePage() {
  const { data: projects } = useProjects()
  const [projectId, setProjectId] = useState("PRJ-1042")
  const { data: events, isLoading } = useTimelineForProject(projectId)
  const evidence = evidenceByProject[projectId] ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <PageHeader
        title="Project Timeline"
        description="Every milestone, payment, inspection, and finding — in one continuous evidence trail."
        actions={
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading || !events ? (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium">No timeline events yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Evidence uploaded for this project will appear here chronologically.
              </p>
            </div>
          ) : (
            events.map((event, i) => (
              <TimelineItem
                key={event.id}
                event={event}
                evidence={evidence}
                index={i}
                isLast={i === events.length - 1}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
