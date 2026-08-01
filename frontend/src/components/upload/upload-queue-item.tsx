import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, Sparkles, X } from "lucide-react"
import { FileTypeIcon } from "@/components/upload/file-icon"
import { Progress } from "@/components/ui/progress"
import type { UploadStage } from "@/services/sentinelApi"

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface UploadQueueItemProps {
  file: File
  progress: number
  stage: UploadStage
  onRemove: () => void
}

const STAGE_LABEL: Record<UploadStage, string> = {
  queued: "Queued",
  uploading: "Uploading",
  processing: "Sentinel is analyzing",
  done: "Analyzed",
  error: "Failed",
}

export function UploadQueueItem({ file, progress, stage, onRemove }: UploadQueueItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <FileTypeIcon file={file} className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <span className="shrink-0 text-xs text-muted-foreground">{formatSize(file.size)}</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <AnimatePresence mode="wait">
            {stage === "processing" ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs text-accent"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </motion.span>
                {STAGE_LABEL[stage]}...
              </motion.div>
            ) : stage === "done" ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 text-xs text-success"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {STAGE_LABEL[stage]}
              </motion.div>
            ) : (
              <motion.div key="progress" className="flex-1">
                <Progress value={progress} className="h-1.5" />
              </motion.div>
            )}
          </AnimatePresence>
          {stage === "uploading" && <span className="text-xs text-muted-foreground">{progress}%</span>}
        </div>
      </div>

      <button
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}
