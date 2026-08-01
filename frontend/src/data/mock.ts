import type {
  AIInsight,
  Alert,
  Evidence,
  KpiSnapshot,
  Project,
  ReasoningStep,
  Report,
  TimelineEvent,
} from "@/types"

const DEPARTMENTS = [
  "Public Works Department",
  "Roads & Bridges Authority",
  "Urban Infrastructure Board",
  "Rural Development Agency",
  "Water Resources Department",
]

export const projects: Project[] = [
  {
    id: "PRJ-1042",
    name: "NH-16 Widening — Vijayawada Bypass",
    department: DEPARTMENTS[1],
    location: "Vijayawada Bypass, Km 12–28",
    district: "Krishna",
    budgetAllocated: 184_00_00_000,
    budgetUtilized: 121_40_00_000,
    status: "at_risk",
    riskLevel: "high",
    aiConfidence: 0.91,
    progress: 62,
    startDate: "2024-02-10",
    expectedCompletion: "2026-03-31",
    contractor: "Sri Balaji Infra Constructions Ltd.",
    lat: 16.5062,
    lng: 80.648,
    lastInspection: "2026-07-18",
  },
  {
    id: "PRJ-1043",
    name: "Krishna River Bridge Rehabilitation",
    department: DEPARTMENTS[0],
    location: "Ibrahimpatnam",
    district: "Krishna",
    budgetAllocated: 96_00_00_000,
    budgetUtilized: 90_10_00_000,
    status: "on_track",
    riskLevel: "low",
    aiConfidence: 0.96,
    progress: 88,
    startDate: "2023-11-01",
    expectedCompletion: "2026-01-15",
    contractor: "Coastal Engineers & Co.",
    lat: 16.535,
    lng: 80.575,
    lastInspection: "2026-07-25",
  },
  {
    id: "PRJ-1044",
    name: "Guntur District Hospital Expansion",
    department: DEPARTMENTS[2],
    location: "Guntur Town",
    district: "Guntur",
    budgetAllocated: 62_50_00_000,
    budgetUtilized: 21_00_00_000,
    status: "delayed",
    riskLevel: "critical",
    aiConfidence: 0.88,
    progress: 34,
    startDate: "2024-06-01",
    expectedCompletion: "2025-12-01",
    contractor: "Medico Structures Pvt. Ltd.",
    lat: 16.3067,
    lng: 80.4365,
    lastInspection: "2026-06-30",
  },
  {
    id: "PRJ-1045",
    name: "Visakhapatnam Smart Drainage Network",
    department: DEPARTMENTS[2],
    location: "Zone 4, Visakhapatnam",
    district: "Visakhapatnam",
    budgetAllocated: 143_00_00_000,
    budgetUtilized: 77_80_00_000,
    status: "on_track",
    riskLevel: "medium",
    aiConfidence: 0.83,
    progress: 54,
    startDate: "2024-04-15",
    expectedCompletion: "2026-05-30",
    contractor: "AquaTech Municipal Systems",
    lat: 17.6868,
    lng: 83.2185,
    lastInspection: "2026-07-10",
  },
  {
    id: "PRJ-1046",
    name: "Rural Road Connectivity — East Godavari Ph. II",
    department: DEPARTMENTS[3],
    location: "36 villages, East Godavari",
    district: "East Godavari",
    budgetAllocated: 54_20_00_000,
    budgetUtilized: 49_00_00_000,
    status: "on_track",
    riskLevel: "low",
    aiConfidence: 0.94,
    progress: 91,
    startDate: "2023-08-20",
    expectedCompletion: "2025-11-01",
    contractor: "Godavari Roadways Ltd.",
    lat: 17.0005,
    lng: 81.8040,
    lastInspection: "2026-07-22",
  },
  {
    id: "PRJ-1047",
    name: "Tirupati Water Supply Modernization",
    department: DEPARTMENTS[4],
    location: "Tirupati Urban Zone",
    district: "Chittoor",
    budgetAllocated: 78_00_00_000,
    budgetUtilized: 34_50_00_000,
    status: "at_risk",
    riskLevel: "high",
    aiConfidence: 0.79,
    progress: 41,
    startDate: "2024-03-05",
    expectedCompletion: "2026-02-28",
    contractor: "Sapthagiri Water Works",
    lat: 13.6288,
    lng: 79.4192,
    lastInspection: "2026-07-05",
  },
  {
    id: "PRJ-1048",
    name: "Anantapur Solar Micro-Grid Rollout",
    department: DEPARTMENTS[3],
    location: "14 mandals, Anantapur",
    district: "Anantapur",
    budgetAllocated: 112_00_00_000,
    budgetUtilized: 60_00_00_000,
    status: "under_review",
    riskLevel: "medium",
    aiConfidence: 0.86,
    progress: 53,
    startDate: "2024-01-10",
    expectedCompletion: "2026-04-30",
    contractor: "Rayalaseema Renewable Energy",
    lat: 14.6819,
    lng: 77.6006,
    lastInspection: "2026-07-14",
  },
  {
    id: "PRJ-1049",
    name: "Kurnool Flyover & Junction Upgrade",
    department: DEPARTMENTS[1],
    location: "Nandyal Road Junction",
    district: "Kurnool",
    budgetAllocated: 67_00_00_000,
    budgetUtilized: 65_10_00_000,
    status: "completed",
    riskLevel: "low",
    aiConfidence: 0.98,
    progress: 100,
    startDate: "2023-05-01",
    expectedCompletion: "2025-06-01",
    contractor: "Kurnool Civil Contractors",
    lat: 15.8281,
    lng: 78.0373,
    lastInspection: "2026-05-12",
  },
]

let evidenceCounter = 0
function makeEvidence(items: Omit<Evidence, "id">[]): Evidence[] {
  return items.map((item) => ({ ...item, id: `EVD-${String(++evidenceCounter).padStart(4, "0")}` }))
}

export const evidenceByProject: Record<string, Evidence[]> = {
  "PRJ-1042": makeEvidence([
    {
      type: "report",
      title: "Site Inspection Report — Km 18",
      source: "Field Engineer, PWD Circle-3",
      timestamp: "2026-07-18T09:20:00+05:30",
      excerpt:
        "Bituminous layer thickness measured at 38mm against sanctioned 50mm on a 400m stretch near Km 18. Photographic evidence attached.",
    },
    {
      type: "payment",
      title: "Interim Payment Certificate #14",
      source: "Finance Cell",
      timestamp: "2026-07-02T00:00:00+05:30",
      excerpt: "₹8.4Cr released against claimed progress of 66%, prior to layer-thickness verification.",
    },
    {
      type: "image",
      title: "Drone Survey — Km 17–19",
      source: "Aerial Monitoring Unit",
      timestamp: "2026-07-17T07:45:00+05:30",
      excerpt: "Visible unevenness and ponding on newly laid surface, inconsistent with spec drawings.",
    },
    {
      type: "complaint",
      title: "Public Grievance #GRV-33812",
      source: "Citizen Portal",
      timestamp: "2026-06-29T18:12:00+05:30",
      excerpt: "Resident reports cracking on service road within 3 weeks of resurfacing.",
    },
  ]),
  "PRJ-1044": makeEvidence([
    {
      type: "report",
      title: "Quarterly Progress Report Q2",
      source: "Project Management Consultant",
      timestamp: "2026-06-30T00:00:00+05:30",
      excerpt: "Structural work delayed by 11 weeks due to steel supply shortage; revised critical path submitted.",
    },
    {
      type: "payment",
      title: "Milestone Payment — Foundation Complete",
      source: "Finance Cell",
      timestamp: "2026-05-20T00:00:00+05:30",
      excerpt: "₹9.1Cr disbursed; utilization rate 34% against elapsed timeline of 58%.",
    },
    {
      type: "document",
      title: "Contractor Extension Request",
      source: "Medico Structures Pvt. Ltd.",
      timestamp: "2026-07-01T00:00:00+05:30",
      excerpt: "Formal request for 90-day extension citing material cost escalation and labor shortage.",
    },
  ]),
}

export const timelineByProject: Record<string, TimelineEvent[]> = {
  "PRJ-1042": [
    {
      id: "TL-1",
      projectId: "PRJ-1042",
      type: "milestone",
      title: "Project Sanctioned",
      description: "Administrative approval issued for NH-16 widening, Km 12–28.",
      date: "2024-02-10",
    },
    {
      id: "TL-2",
      projectId: "PRJ-1042",
      type: "payment",
      title: "Mobilization Advance Released",
      description: "₹18.4Cr released to contractor for site mobilization.",
      date: "2024-03-01",
      amount: 184_000_000,
    },
    {
      id: "TL-3",
      projectId: "PRJ-1042",
      type: "inspection",
      title: "Quarterly Quality Audit",
      description: "Sub-grade compaction verified within tolerance across 8km stretch.",
      date: "2025-01-20",
      riskLevel: "low",
    },
    {
      id: "TL-4",
      projectId: "PRJ-1042",
      type: "complaint",
      title: "Grievance Filed",
      description: "Resident reports cracking on service road within weeks of resurfacing.",
      date: "2026-06-29",
      riskLevel: "medium",
      evidenceIds: ["EVD-0004"],
    },
    {
      id: "TL-5",
      projectId: "PRJ-1042",
      type: "report",
      title: "Site Inspection Report Filed",
      description: "Bituminous layer thickness deficit recorded near Km 18.",
      date: "2026-07-18",
      riskLevel: "high",
      evidenceIds: ["EVD-0001", "EVD-0003"],
    },
    {
      id: "TL-6",
      projectId: "PRJ-1042",
      type: "ai_finding",
      title: "AI Flags Payment-Progress Mismatch",
      description: "Sentinel correlated IPC #14 disbursement with unverified progress claims.",
      date: "2026-07-19",
      riskLevel: "high",
      evidenceIds: ["EVD-0002"],
    },
  ],
}

const reasoningByProject: Record<string, ReasoningStep[]> = {
  "PRJ-1042": [
    {
      id: "RS-1",
      kind: "observation",
      title: "Layer thickness deficit recorded",
      detail:
        "Field inspection on 18 Jul 2026 measured bituminous layer thickness at 38mm against the sanctioned 50mm specification across a 400m stretch near Km 18.",
      confidence: 0.95,
      citedEvidenceIds: ["EVD-0001"],
    },
    {
      id: "RS-2",
      kind: "correlation",
      title: "Payment preceded verification",
      detail:
        "Interim Payment Certificate #14 (₹8.4Cr) was processed on 2 Jul 2026, 16 days before the deficiency was documented, against a claimed progress of 66%.",
      confidence: 0.9,
      citedEvidenceIds: ["EVD-0002"],
    },
    {
      id: "RS-3",
      kind: "anomaly",
      title: "Independent aerial survey corroborates defect",
      detail:
        "Drone survey imagery from 17 Jul 2026 shows surface unevenness and ponding consistent with under-specification, independent of the ground inspection team.",
      confidence: 0.88,
      citedEvidenceIds: ["EVD-0003"],
    },
    {
      id: "RS-4",
      kind: "anomaly",
      title: "Citizen complaint aligns with defect location",
      detail:
        "Public grievance #GRV-33812 filed 29 Jun 2026 reports cracking in the same segment, filed before either inspection — suggesting the defect predates formal detection.",
      confidence: 0.82,
      citedEvidenceIds: ["EVD-0004"],
    },
    {
      id: "RS-5",
      kind: "conclusion",
      title: "Recommend payment hold and re-inspection",
      detail:
        "Three independent evidence sources (inspection, aerial survey, citizen report) converge on the same defect. Combined with payment sequencing, this indicates elevated risk of substandard work being certified for payment.",
      confidence: 0.91,
      citedEvidenceIds: ["EVD-0001", "EVD-0002", "EVD-0003", "EVD-0004"],
    },
  ],
}

export const insights: AIInsight[] = [
  {
    id: "INS-501",
    projectId: "PRJ-1042",
    title: "Payment certified ahead of quality verification",
    summary:
      "Sentinel detected that Interim Payment Certificate #14 was disbursed before layer-thickness deficiencies were documented on site, with corroborating aerial and citizen evidence pointing to the same location.",
    riskLevel: "high",
    confidence: 0.91,
    recommendation:
      "Hold remaining payments for the Km 17–19 segment pending re-inspection. Require contractor to submit corrective action plan within 14 days.",
    generatedAt: "2026-07-19T11:05:00+05:30",
    evidence: evidenceByProject["PRJ-1042"],
    reasoning: reasoningByProject["PRJ-1042"],
    tags: ["quality-risk", "payment-anomaly", "NH-16"],
  },
  {
    id: "INS-502",
    projectId: "PRJ-1044",
    title: "Schedule slippage risk driven by material supply",
    summary:
      "Progress (34%) is significantly behind elapsed timeline (58%). Contractor has formally requested a 90-day extension citing steel shortage, consistent with observed foundation delays.",
    riskLevel: "critical",
    confidence: 0.88,
    recommendation:
      "Convene review committee within 7 days. Evaluate alternate steel sourcing support or phased de-scoping to protect the December 2025 handover target.",
    generatedAt: "2026-07-02T10:00:00+05:30",
    evidence: evidenceByProject["PRJ-1044"],
    reasoning: [
      {
        id: "RS-6",
        kind: "observation",
        title: "Progress-timeline gap widening",
        detail: "34% physical progress against 58% elapsed schedule — a 24-point gap, up from 9 points last quarter.",
        confidence: 0.93,
        citedEvidenceIds: [],
      },
      {
        id: "RS-7",
        kind: "conclusion",
        title: "Extension request is consistent with root cause",
        detail: "Contractor's stated reason (steel shortage) matches the delay pattern observed in foundation-stage milestones.",
        confidence: 0.85,
        citedEvidenceIds: [],
      },
    ],
    tags: ["schedule-risk", "supply-chain"],
  },
]

export const reports: Report[] = [
  {
    id: "RPT-2201",
    projectId: "PRJ-1042",
    title: "NH-16 Widening — Q3 Quality & Compliance Report",
    status: "flagged",
    riskLevel: "high",
    createdAt: "2026-07-19",
    author: "Sentinel AI + Field Engineer Review",
    summary:
      "Combined AI and field findings on layer-thickness deficiency and payment sequencing anomaly near Km 18.",
    pages: 14,
    images: [],
  },
  {
    id: "RPT-2202",
    projectId: "PRJ-1044",
    title: "Guntur District Hospital — Progress Review",
    status: "final",
    riskLevel: "critical",
    createdAt: "2026-07-02",
    author: "Project Management Consultant",
    summary: "Schedule slippage analysis with contractor extension request and recommended mitigation.",
    pages: 9,
    images: [],
  },
  {
    id: "RPT-2203",
    projectId: "PRJ-1043",
    title: "Krishna River Bridge — Final Inspection",
    status: "final",
    riskLevel: "low",
    createdAt: "2026-07-25",
    author: "Chief Engineer, PWD",
    summary: "Structural integrity confirmed. Cleared for commissioning ahead of schedule.",
    pages: 6,
    images: [],
  },
  {
    id: "RPT-2204",
    projectId: "PRJ-1047",
    title: "Tirupati Water Supply — Risk Assessment",
    status: "draft",
    riskLevel: "high",
    createdAt: "2026-07-05",
    author: "Sentinel AI",
    summary: "Budget utilization trailing progress; procurement delays flagged for review.",
    pages: 5,
    images: [],
  },
]

export const alerts: Alert[] = [
  {
    id: "ALT-01",
    projectId: "PRJ-1042",
    title: "Payment-quality mismatch detected",
    description: "IPC #14 disbursed ahead of verified layer-thickness compliance.",
    riskLevel: "high",
    createdAt: "2026-07-19",
  },
  {
    id: "ALT-02",
    projectId: "PRJ-1044",
    title: "Critical schedule slippage",
    description: "24-point gap between physical progress and elapsed timeline.",
    riskLevel: "critical",
    createdAt: "2026-07-02",
  },
  {
    id: "ALT-03",
    projectId: "PRJ-1047",
    title: "Budget utilization trailing plan",
    description: "44% utilized against 52% elapsed timeline; procurement delays cited.",
    riskLevel: "medium",
    createdAt: "2026-07-05",
  },
]

export const kpiSnapshot: KpiSnapshot = {
  totalProjects: projects.length,
  totalBudget: projects.reduce((sum, p) => sum + p.budgetAllocated, 0),
  budgetUtilized: projects.reduce((sum, p) => sum + p.budgetUtilized, 0),
  highRiskProjects: projects.filter((p) => p.riskLevel === "high" || p.riskLevel === "critical").length,
  avgAiConfidence: projects.reduce((sum, p) => sum + p.aiConfidence, 0) / projects.length,
  inspectionsThisMonth: 11,
  activeAlerts: alerts.length,
}

export const budgetTrend = [
  { month: "Feb", allocated: 620, utilized: 180 },
  { month: "Mar", allocated: 640, utilized: 240 },
  { month: "Apr", allocated: 660, utilized: 310 },
  { month: "May", allocated: 680, utilized: 390 },
  { month: "Jun", allocated: 690, utilized: 460 },
  { month: "Jul", allocated: 696, utilized: 519 },
]

export const riskDistribution = [
  { name: "Low", value: projects.filter((p) => p.riskLevel === "low").length, key: "low" },
  { name: "Medium", value: projects.filter((p) => p.riskLevel === "medium").length, key: "medium" },
  { name: "High", value: projects.filter((p) => p.riskLevel === "high").length, key: "high" },
  { name: "Critical", value: projects.filter((p) => p.riskLevel === "critical").length, key: "critical" },
]

export const inspectionsTrend = [
  { month: "Feb", count: 6 },
  { month: "Mar", count: 8 },
  { month: "Apr", count: 7 },
  { month: "May", count: 10 },
  { month: "Jun", count: 9 },
  { month: "Jul", count: 11 },
]

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

export function getInsightsForProject(id: string): AIInsight[] {
  return insights.filter((i) => i.projectId === id)
}

export function getTimelineForProject(id: string): TimelineEvent[] {
  return timelineByProject[id] ?? []
}

export function getReportsForProject(id: string): Report[] {
  return reports.filter((r) => r.projectId === id)
}

export function getReport(id: string): Report | undefined {
  return reports.find((r) => r.id === id)
}
