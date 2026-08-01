import type { RiskLevel } from "@/types"
import { riskTokens } from "@/utils/format"
import { cn } from "@/lib/utils"

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const tokens = riskTokens[level]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tokens.bg,
        tokens.color,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tokens.dot)} />
      {tokens.label} Risk
    </span>
  )
}
