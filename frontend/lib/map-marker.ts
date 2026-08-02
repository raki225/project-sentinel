import L from "leaflet"
import type { RiskTier } from "./api"

export type RiskTone = "verified" | "pending" | "flagged"

export function toneFromRisk(risk: RiskTier): RiskTone {
  if (risk === "high") return "flagged"
  if (risk === "medium") return "pending"
  return "verified"
}

const TONE_HEX: Record<RiskTone, string> = {
  verified: "#16a34a",
  pending: "#d97706",
  flagged: "#dc2626",
}

export function markerIcon(tone: RiskTone) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${TONE_HEX[tone]};border:2px solid white;box-shadow:0 0 0 2px rgba(0,0,0,0.25)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  })
}
