"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { AlertTriangle, MapPin, RefreshCw, ShieldAlert, Sparkles } from "lucide-react"
import { getProjectsMap, API_BASE_URL, ApiError, type ProjectMapPoint } from "@/lib/api"
import { DEMO_PROJECT_MAP_POINTS } from "@/lib/demo-map-data"
import { toneFromRisk, markerIcon } from "@/lib/map-marker"
import { cn } from "@/lib/utils"

const INDIA_CENTER: [number, number] = [22.9734, 78.6569]

export default function ProjectMap({ height = 420, showStats = false }: { height?: number; showStats?: boolean }) {
  const [points, setPoints] = useState<ProjectMapPoint[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  async function load() {
    setStatus("loading")
    try {
      const { points } = await getProjectsMap()
      setPoints(points)
      setStatus("ready")
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Could not reach the Sentinel API. Is the backend running?",
      )
      setStatus("error")
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Never show a blank map: fall back to sample projects until the backend has real geocoded reports.
  const isDemo = status !== "error" && points.length === 0
  const displayPoints = isDemo ? DEMO_PROJECT_MAP_POINTS : points

  const highRisk = displayPoints.filter((p) => p.risk === "high").length
  const districts = new Set(displayPoints.map((p) => p.district).filter(Boolean)).size

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-border" style={{ height }}>
        {status === "loading" && (
          <div className="absolute inset-0 z-[500] grid place-items-center bg-card/70 backdrop-blur-sm">
            <span className="text-sm text-muted-foreground">Loading live map…</span>
          </div>
        )}

        {status === "error" ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-card p-6 text-center">
            <AlertTriangle className="size-5 text-flagged" />
            <p className="max-w-xs text-xs text-muted-foreground">{errorMessage}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              <RefreshCw className="size-3.5" />
              Retry
            </button>
          </div>
        ) : (
          <>
            {isDemo && (
              <div className="absolute left-3 top-3 z-[500] flex items-center gap-1.5 rounded-full border border-primary/30 bg-card/90 px-3 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur">
                <Sparkles className="size-3.5" />
                Demo mode — sample projects
              </div>
            )}
            <MapContainer center={INDIA_CENTER} zoom={5} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {displayPoints.map((point) => {
                const tone = toneFromRisk(point.risk)
                return (
                  <Marker key={point.id} position={[point.lat, point.lng]} icon={markerIcon(tone)}>
                    <Popup>
                      <div className="min-w-[190px] space-y-2 text-sm">
                        <div className="font-semibold">{point.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {[point.department, point.district].filter(Boolean).join(" · ")}
                        </div>
                        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 border-t border-border/60 pt-2 text-xs">
                          <dt className="text-muted-foreground">Budget</dt>
                          <dd className="text-right font-medium">{point.budget || "—"}</dd>
                          <dt className="text-muted-foreground">Progress</dt>
                          <dd className="text-right font-medium">{point.progress || "—"}</dd>
                          <dt className="text-muted-foreground">Risk</dt>
                          <dd
                            className={cn(
                              "text-right font-semibold uppercase",
                              tone === "verified" && "text-verified",
                              tone === "pending" && "text-pending",
                              tone === "flagged" && "text-flagged",
                            )}
                          >
                            {point.risk}
                          </dd>
                          <dt className="text-muted-foreground">AI Confidence</dt>
                          <dd className="text-right font-medium">{point.confidence}%</dd>
                        </dl>
                        {isDemo ? (
                          <p className="pt-1 text-[11px] italic text-muted-foreground">Sample data</p>
                        ) : (
                          <a
                            href={`${API_BASE_URL}/report/${point.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-primary hover:underline"
                          >
                            Open report →
                          </a>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </>
        )}
      </div>

      {showStats && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { k: "Active points", v: displayPoints.length, icon: MapPin },
            { k: "Districts covered", v: districts, icon: MapPin },
            { k: "High risk", v: highRisk, icon: ShieldAlert },
          ].map((s) => (
            <div key={s.k} className="rounded-xl border border-border bg-background/50 p-3">
              <s.icon className="size-4 text-primary" />
              <div className="mt-2 font-display text-lg font-bold">{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.k}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
