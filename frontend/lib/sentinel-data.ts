export type ProjectStatus = "verified" | "pending" | "flagged"

export type ProjectPhase = "planned" | "in-progress" | "completed" | "delayed" | "verifying"

export type SentinelProject = {
  id: string
  name: string
  category: string
  department: string
  state: string
  district: string
  sanctioned: number // in crore
  released: number
  utilized: number
  progress: number
  integrity: number
  status: ProjectStatus
  phase: ProjectPhase
  milestones: number
  milestonesDone: number
  contractor: string
  started: string
  expectedCompletion: string
  stage: string
  image: string
  lastEvent: string
}

export const PHASE_META: Record<ProjectPhase, { label: string; tone: "verified" | "pending" | "flagged" | "primary" | "neutral" }> = {
  planned: { label: "Planned", tone: "neutral" },
  "in-progress": { label: "In Progress", tone: "primary" },
  completed: { label: "Completed", tone: "verified" },
  delayed: { label: "Delayed", tone: "flagged" },
  verifying: { label: "Under AI Verification", tone: "pending" },
}

export const PROJECTS: SentinelProject[] = [
  {
    id: "PSN-4471",
    name: "Coastal Ring Expressway — Phase II",
    category: "Roads & Highways",
    department: "Ministry of Road Transport",
    state: "Maharashtra",
    district: "Raigad",
    sanctioned: 1840,
    released: 1210,
    utilized: 1096,
    progress: 62,
    integrity: 94,
    status: "verified",
    phase: "in-progress",
    milestones: 8,
    milestonesDone: 5,
    contractor: "Meridian Infra Ltd.",
    started: "Mar 2023",
    expectedCompletion: "Dec 2025",
    stage: "Deck casting — Span 4 of 6",
    image: "/projects/road.png",
    lastEvent: "Milestone 5 evidence verified",
  },
  {
    id: "PSN-3920",
    name: "District Water Grid & Treatment Network",
    category: "Water & Sanitation",
    department: "Jal Shakti Board",
    state: "Rajasthan",
    district: "Jodhpur",
    sanctioned: 640,
    released: 402,
    utilized: 351,
    progress: 48,
    integrity: 88,
    status: "verified",
    phase: "in-progress",
    milestones: 6,
    milestonesDone: 3,
    contractor: "AquaWorks Consortium",
    started: "Jul 2023",
    expectedCompletion: "Aug 2025",
    stage: "Trunk pipeline laying — Zone 3",
    image: "/projects/water.png",
    lastEvent: "Pipeline satellite scan completed",
  },
  {
    id: "PSN-5108",
    name: "Metro Rail Corridor — Blue Line",
    category: "Urban Transit",
    department: "Metropolitan Development Authority",
    state: "Karnataka",
    district: "Bengaluru Urban",
    sanctioned: 9420,
    released: 5100,
    utilized: 4980,
    progress: 54,
    integrity: 91,
    status: "pending",
    phase: "verifying",
    milestones: 12,
    milestonesDone: 6,
    contractor: "TransUrban Alliance",
    started: "Jan 2022",
    expectedCompletion: "Jun 2027",
    stage: "Tunnel boring — North reach",
    image: "/projects/rail.png",
    lastEvent: "Tunnel boring invoice under review",
  },
  {
    id: "PSN-2277",
    name: "Rural Health Sub-Centre Upgrade",
    category: "Healthcare",
    department: "Department of Health & Family Welfare",
    state: "Bihar",
    district: "Gaya",
    sanctioned: 210,
    released: 180,
    utilized: 92,
    progress: 31,
    integrity: 61,
    status: "flagged",
    phase: "delayed",
    milestones: 5,
    milestonesDone: 1,
    contractor: "Nirman Buildcon",
    started: "Sep 2023",
    expectedCompletion: "Mar 2025",
    stage: "Foundation & plinth — stalled",
    image: "/projects/hospital.png",
    lastEvent: "Fund-to-progress mismatch detected",
  },
  {
    id: "PSN-6634",
    name: "Solar Micro-Grid Electrification",
    category: "Energy",
    department: "Ministry of New & Renewable Energy",
    state: "Gujarat",
    district: "Kutch",
    sanctioned: 1120,
    released: 890,
    utilized: 861,
    progress: 78,
    integrity: 96,
    status: "verified",
    phase: "in-progress",
    milestones: 7,
    milestonesDone: 6,
    contractor: "Helios Power Systems",
    started: "Feb 2023",
    expectedCompletion: "Nov 2024",
    stage: "Panel array commissioning — 82%",
    image: "/projects/solar.png",
    lastEvent: "Capacity output field-verified",
  },
  {
    id: "PSN-1902",
    name: "Riverfront Flood Defence Embankment",
    category: "Disaster Resilience",
    department: "State Irrigation Directorate",
    state: "Assam",
    district: "Dibrugarh",
    sanctioned: 480,
    released: 300,
    utilized: 214,
    progress: 44,
    integrity: 73,
    status: "pending",
    phase: "verifying",
    milestones: 6,
    milestonesDone: 2,
    contractor: "DeltaCivil Engineers",
    started: "May 2023",
    expectedCompletion: "Oct 2025",
    stage: "Embankment earthworks — 12.4 km",
    image: "/projects/shield.png",
    lastEvent: "Awaiting geotechnical evidence",
  },
  {
    id: "PSN-7781",
    name: "Government Model School Complex",
    category: "Education",
    department: "Department of School Education",
    state: "Tamil Nadu",
    district: "Coimbatore",
    sanctioned: 320,
    released: 260,
    utilized: 248,
    progress: 82,
    integrity: 93,
    status: "verified",
    phase: "in-progress",
    milestones: 5,
    milestonesDone: 4,
    contractor: "Vidya Constructions",
    started: "Apr 2023",
    expectedCompletion: "May 2025",
    stage: "Finishing & fit-out — Block D",
    image: "/projects/school.png",
    lastEvent: "Block C occupancy certified",
  },
  {
    id: "PSN-3345",
    name: "Freight Logistics Cold-Chain Hub",
    category: "Logistics",
    department: "Department of Commerce",
    state: "Punjab",
    district: "Ludhiana",
    sanctioned: 760,
    released: 610,
    utilized: 402,
    progress: 39,
    integrity: 58,
    status: "flagged",
    phase: "delayed",
    milestones: 7,
    milestonesDone: 2,
    contractor: "ColdLink Infra",
    started: "Aug 2023",
    expectedCompletion: "Feb 2025",
    stage: "Cold-storage shell — under audit",
    image: "/projects/logistics.png",
    lastEvent: "Duplicate invoice pattern flagged",
  },
]

export type CategoryMeta = {
  name: string
  icon: "road" | "bridge" | "school" | "hospital" | "water" | "solar" | "rail" | "shield"
  count: number
  sanctioned: number
  verifiedPct: number
}

export const CATEGORIES: CategoryMeta[] = [
  { name: "Roads & Highways", icon: "road", count: 312, sanctioned: 28400, verifiedPct: 89 },
  { name: "Bridges & Flyovers", icon: "bridge", count: 96, sanctioned: 7600, verifiedPct: 84 },
  { name: "Schools & Education", icon: "school", count: 214, sanctioned: 3200, verifiedPct: 92 },
  { name: "Hospitals & Health", icon: "hospital", count: 138, sanctioned: 9100, verifiedPct: 86 },
  { name: "Water & Sanitation", icon: "water", count: 187, sanctioned: 5400, verifiedPct: 79 },
  { name: "Energy & Solar", icon: "solar", count: 124, sanctioned: 12600, verifiedPct: 91 },
  { name: "Urban Transit", icon: "rail", count: 71, sanctioned: 15800, verifiedPct: 81 },
  { name: "Disaster Resilience", icon: "shield", count: 142, sanctioned: 2140, verifiedPct: 76 },
]

export type TimelinePoint = {
  q: string
  sanctioned: number
  verified: number
}

export const FUND_TIMELINE: TimelinePoint[] = [
  { q: "Q1 '23", sanctioned: 14200, verified: 11800 },
  { q: "Q2 '23", sanctioned: 16800, verified: 13900 },
  { q: "Q3 '23", sanctioned: 19400, verified: 16100 },
  { q: "Q4 '23", sanctioned: 22100, verified: 18200 },
  { q: "Q1 '24", sanctioned: 18600, verified: 16100 },
  { q: "Q2 '24", sanctioned: 23900, verified: 20700 },
  { q: "Q3 '24", sanctioned: 26100, verified: 23100 },
  { q: "Q4 '24", sanctioned: 28800, verified: 25800 },
  { q: "Q1 '25", sanctioned: 24600, verified: 22100 },
  { q: "Q2 '25", sanctioned: 27300, verified: 24900 },
]

export type AIActivity = {
  time: string
  type: "verify" | "flag" | "scan" | "ledger"
  title: string
  detail: string
}

export const AI_ACTIVITY: AIActivity[] = [
  { time: "just now", type: "verify", title: "Milestone 5 auto-verified", detail: "Coastal Ring Expressway · AI confidence 96%" },
  { time: "2 min ago", type: "flag", title: "Fund-to-progress mismatch flagged", detail: "Rural Health Sub-Centre · PSN-2277" },
  { time: "6 min ago", type: "ledger", title: "₹120 Cr tranche written to ledger", detail: "Solar Micro-Grid · Ledger #88213" },
  { time: "14 min ago", type: "scan", title: "Satellite scan matched pipeline route", detail: "District Water Grid · Geo-match 99.1%" },
  { time: "23 min ago", type: "verify", title: "Block C occupancy certified", detail: "Government Model School · evidence 4/4" },
  { time: "38 min ago", type: "flag", title: "Duplicate invoice pattern detected", detail: "Cold-Chain Hub · PSN-3345" },
  { time: "51 min ago", type: "scan", title: "Drone survey cross-checked embankment", detail: "Riverfront Flood Defence · 12.4 km" },
  { time: "1 hr ago", type: "ledger", title: "Milestone closure recorded", detail: "Metro Blue Line · 6 of 12 complete" },
]

export type MapPoint = {
  id: string
  x: number
  y: number
  status: ProjectStatus
  label: string
}

export const MAP_POINTS: MapPoint[] = [
  { id: "PSN-4471", x: 24, y: 58, status: "verified", label: "Coastal Ring Expressway" },
  { id: "PSN-3920", x: 38, y: 38, status: "verified", label: "District Water Grid" },
  { id: "PSN-5108", x: 44, y: 72, status: "pending", label: "Metro Blue Line" },
  { id: "PSN-2277", x: 62, y: 52, status: "flagged", label: "Rural Health Sub-Centre" },
  { id: "PSN-6634", x: 18, y: 48, status: "verified", label: "Solar Micro-Grid" },
  { id: "PSN-1902", x: 72, y: 30, status: "pending", label: "Riverfront Flood Defence" },
  { id: "PSN-7781", x: 52, y: 82, status: "verified", label: "Model School Complex" },
  { id: "PSN-3345", x: 34, y: 24, status: "flagged", label: "Cold-Chain Hub" },
]

export const STATES = [
  "Maharashtra",
  "Rajasthan",
  "Karnataka",
  "Bihar",
  "Gujarat",
  "Assam",
  "Tamil Nadu",
  "Punjab",
]

export function formatCrore(n: number) {
  if (n >= 1000) return `₹${(n / 1000).toFixed(2)}K Cr`
  return `₹${n.toLocaleString("en-IN")} Cr`
}

/* Map a project category to a CategoryIcon key */
export const CATEGORY_ICON_KEY: Record<string, string> = {
  "Roads & Highways": "road",
  "Water & Sanitation": "water",
  "Urban Transit": "rail",
  Healthcare: "hospital",
  Energy: "solar",
  "Disaster Resilience": "shield",
  Education: "school",
  Logistics: "bridge",
}

export type TransparencyTier = "High" | "Medium" | "Low"

export function transparencyTier(integrity: number): TransparencyTier {
  if (integrity >= 85) return "High"
  if (integrity >= 70) return "Medium"
  return "Low"
}

/* Derive a quality label from integrity + progress */
export function qualityStatus(p: { integrity: number; status: ProjectStatus }): {
  label: string
  tone: "verified" | "pending" | "flagged"
} {
  if (p.status === "flagged") return { label: "Quality review", tone: "flagged" }
  if (p.integrity >= 88) return { label: "Quality passed", tone: "verified" }
  return { label: "Sampling QA", tone: "pending" }
}

/* Derive a funding label from released vs utilized */
export function fundingStatus(p: { released: number; utilized: number; status: ProjectStatus }): {
  label: string
  tone: "verified" | "pending" | "flagged"
} {
  const idleRatio = (p.released - p.utilized) / Math.max(p.released, 1)
  if (p.status === "flagged") return { label: "Funds under audit", tone: "flagged" }
  if (idleRatio > 0.35) return { label: "Funds idle", tone: "pending" }
  return { label: "Funds flowing", tone: "verified" }
}

export function projectSummary(p: SentinelProject): string {
  const tier = transparencyTier(p.integrity).toLowerCase()
  const docs =
    p.status === "flagged"
      ? "documents flagged for review"
      : p.status === "pending"
        ? "documents under AI verification"
        : "all submitted documents verified"
  return `${p.name} is ${p.progress}% complete with ${p.integrity}% ${tier} transparency and ${docs}.`
}
