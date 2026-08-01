import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useProjects } from "@/hooks/use-sentinel"
import { Skeleton } from "@/components/ui/skeleton"
import { riskTokens } from "@/utils/format"

const BOUNDS = { minLat: 13.2, maxLat: 18.0, minLng: 77.2, maxLng: 83.6 }

function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100
  const y = 100 - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100
  return { x: Math.min(96, Math.max(4, x)), y: Math.min(92, Math.max(8, y)) }
}

export function ProjectMap() {
  const { data, isLoading } = useProjects()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Infrastructure Locations</CardTitle>
        <p className="text-xs text-muted-foreground">Live project sites across Andhra Pradesh</p>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-80 rounded-xl" />
        ) : (
          <div
            className="relative h-80 overflow-hidden rounded-xl border border-border"
            style={{
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              backgroundColor: "var(--muted)",
            }}
          >
            {data.map((proj, i) => {
              const pos = project(proj.lat, proj.lng)
              const tokens = riskTokens[proj.riskLevel]
              return (
                <Tooltip key={proj.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    >
                      <Link to="/insights/$projectId" params={{ projectId: proj.id }}>
                        <span className="relative flex h-3.5 w-3.5">
                          <span
                            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${tokens.dot}`}
                          />
                          <span
                            className={`relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-card ${tokens.dot}`}
                          />
                        </span>
                      </Link>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{proj.name}</p>
                    <p className="text-muted-foreground">{proj.district} · {tokens.label} Risk</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
