import { FileArchive, FileImage, FileSpreadsheet, FileText, File as FileIcon } from "lucide-react"

export function getFileKind(file: File): "pdf" | "doc" | "image" | "csv" | "zip" | "other" {
  const name = file.name.toLowerCase()
  if (name.endsWith(".pdf")) return "pdf"
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "doc"
  if (name.endsWith(".csv") || name.endsWith(".xlsx")) return "csv"
  if (name.endsWith(".zip")) return "zip"
  if (file.type.startsWith("image/")) return "image"
  return "other"
}

export function FileTypeIcon({ file, className }: { file: File; className?: string }) {
  const kind = getFileKind(file)
  switch (kind) {
    case "pdf":
    case "doc":
      return <FileText className={className} />
    case "image":
      return <FileImage className={className} />
    case "csv":
      return <FileSpreadsheet className={className} />
    case "zip":
      return <FileArchive className={className} />
    default:
      return <FileIcon className={className} />
  }
}
