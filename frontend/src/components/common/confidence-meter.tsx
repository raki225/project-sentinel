import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ConfidenceMeterProps {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

export function ConfidenceMeter({
  value,
  size = 96,
  strokeWidth = 8,
  label = "AI Confidence",
  className,
}: ConfidenceMeterProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - value)

  const tone = value >= 0.85 ? "text-success" : value >= 0.65 ? "text-warning" : "text-danger"

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={tone}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold tabular-nums">{Math.round(value * 100)}%</span>
        </div>
      </div>
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
    </div>
  )
}
