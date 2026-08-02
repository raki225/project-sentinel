"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, TriangleAlert as AlertTriangle, Activity as ActivityIcon, RefreshCw } from "lucide-react"
import { getLiveActivity, type ActivityItem, type ActivitySeverity } from "@/lib/api"
import { cn } from "@/lib/utils"

const POLL_INTERVAL_MS = 10_000

const SEVERITY_META: Record<ActivitySeverity, { icon: typeof ActivityIcon; tone: string }> = {
  high: { icon: AlertTriangle, tone: "text-flagged bg-flagged/10" },
  medium: { icon: ActivityIcon, tone: "text-pending bg-pending/10" },
  low: { icon: ShieldCheck, tone: "text-verified bg-verified/10" },
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.floor(hours / 24)} d ago`
}

export default function LiveActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  async function load() {
    try {
      const { activity } = await getLiveActivity(8)
      setItems(activity)
      setStatus("ready")
    } catch {
      setStatus("error")
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/70 p-6 text-center">
        <p className="text-xs text-muted-foreground">Could not reach the Sentinel API.</p>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
        >
          <RefreshCw className="size-3.5" />
          Retry
        </button>
      </div>
    )
  }

  if (status === "loading") {
    return (
      <div className="rounded-xl border border-border bg-card/70 p-6 text-center text-xs text-muted-foreground">
        Loading activity…
      </div>
    )
  }

  if (status === "ready" && items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/70 p-6 text-center text-xs text-muted-foreground">
        No activity yet — upload and analyze a document to populate this feed.
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {items.map((item, idx) => {
        const meta = SEVERITY_META[item.severity]
        const Icon = meta.icon
        return (
          <div
            key={item.id}
            className="animate-rise flex items-start gap-3 rounded-xl border border-border bg-card/70 p-3"
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg", meta.tone)}>
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug text-foreground">{item.title}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{timeAgo(item.timestamp)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
