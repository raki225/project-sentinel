import { useCallback, useRef, useState } from "react"
import { motion } from "framer-motion"
import { UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"

const ACCEPTED = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.csv,.xlsx,.zip"

interface DropzoneProps {
  onFiles: (files: File[]) => void
}

export function Dropzone({ onFiles }: DropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragging(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length) onFiles(files)
    },
    [onFiles],
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
      }}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors",
        dragging ? "border-accent bg-accent-soft" : "border-border bg-muted/30 hover:border-accent/40",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) onFiles(files)
          e.target.value = ""
        }}
      />

      <motion.div
        animate={dragging ? { y: -6, scale: 1.05 } : { y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent"
      >
        <UploadCloud className="h-7 w-7" />
      </motion.div>

      <p className="mt-5 text-base font-medium">
        {dragging ? "Drop to upload" : "Drag & drop evidence files"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        or <span className="font-medium text-accent">browse from your device</span>
      </p>
      <p className="mt-4 text-xs text-muted-foreground/70">PDF, DOCX, Images, CSV, ZIP — up to 50MB per file</p>
    </div>
  )
}
