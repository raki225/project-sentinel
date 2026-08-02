import { useId } from "react"
import { cn } from "@/lib/utils"

/** Animated SVG "AI core" brand mark — an orbiting ring around a pulsing gradient core. */
export function BrandMark({ className }: { className?: string }) {
  // useId() keeps the gradient id unique (and identical between server/client render)
  // even if this component is ever mounted more than once on the same page.
  const gradientId = `sentinel-core-${useId()}`

  return (
    <span className={cn("relative grid size-9 shrink-0 place-items-center", className)}>
      <svg viewBox="0 0 36 36" className="size-9" aria-hidden="true">
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.22"
          strokeWidth="1.4"
          strokeDasharray="2.5 4"
          className="origin-center animate-orbit"
        />
        <circle
          cx="18"
          cy="18"
          r="11.5"
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.15"
          strokeWidth="1"
          strokeDasharray="0.5 3.5"
          className="origin-center animate-orbit-reverse"
        />

        <circle cx="18" cy="18" r="10" fill={`url(#${gradientId})`} className="origin-center animate-core-glow" />
        <circle cx="18" cy="18" r="4" fill="var(--primary)" />

        <g className="origin-center animate-orbit">
          <circle cx="18" cy="2.8" r="1.5" fill="var(--verified)" />
        </g>
      </svg>
    </span>
  )
}
