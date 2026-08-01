import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { PageHeader } from "@/components/common/page-header"
import { Dropzone } from "@/components/upload/dropzone"
import { UploadQueueItem } from "@/components/upload/upload-queue-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { simulateUpload, type UploadStage } from "@/services/sentinelApi"

interface QueuedFile {
  id: string
  file: File
  progress: number
  stage: UploadStage
}

export const Route = createFileRoute("/_app/upload")({
  component: UploadPage,
})

function UploadPage() {
  const [queue, setQueue] = useState<QueuedFile[]>([])

  const addFiles = (files: File[]) => {
    const entries: QueuedFile[] = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      progress: 0,
      stage: "queued",
    }))
    setQueue((prev) => [...entries, ...prev])

    entries.forEach((entry) => {
      simulateUpload({ id: entry.id, file: entry.file }, (percent, stage) => {
        setQueue((prev) =>
          prev.map((item) => (item.id === entry.id ? { ...item, progress: percent, stage } : item)),
        )
      })
    })
  }

  const removeFile = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id))
  }

  const doneCount = queue.filter((q) => q.stage === "done").length

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <PageHeader
        title="Upload Evidence"
        description="Field reports, inspection photos, payment records, and grievances — Sentinel reads them all."
      />

      <Dropzone onFiles={addFiles} />

      {queue.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Upload Queue</CardTitle>
            <span className="text-xs text-muted-foreground">
              {doneCount} of {queue.length} analyzed
            </span>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <AnimatePresence initial={false}>
              {queue.map((item) => (
                <UploadQueueItem
                  key={item.id}
                  file={item.file}
                  progress={item.progress}
                  stage={item.stage}
                  onRemove={() => removeFile(item.id)}
                />
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
