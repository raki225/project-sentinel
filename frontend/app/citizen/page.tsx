"use client"

import React, { useState } from "react"
import dynamic from "next/dynamic"
import { DashboardLayout } from "@/components/sentinel/dashboard-layout"
import { PROJECTS, formatCrore } from "@/lib/sentinel-data"
import {
  Search,
  MapPin,
  Heart,
  MessageSquarePlus,
  Eye,
  ThumbsUp,
  CheckCircle2,
  ShieldCheck,
  Send,
  Sparkles,
  AlertTriangle,
  Camera,
  Clock,
  Filter,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ProjectMap = dynamic(() => import("@/components/sentinel/project-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[320px] place-items-center rounded-xl border border-border bg-card/40">
      <span className="text-xs text-muted-foreground">Loading Public Infrastructure Map…</span>
    </div>
  ),
})

const MOCK_COMPLAINTS = [
  { id: "GRV-9428", project: "Hyderabad Outer Ring Road Expansion", category: "Pothole & Surface Damage", date: "Aug 1, 2026", status: "Under Investigation", dept: "PWD Telangana", notes: "Assigned to Superintending Engineer Er. Vikram Reddy" },
  { id: "GRV-9402", project: "Godavari Drinking Water Pipeline", category: "Pipe Leakage & Delay", date: "Jul 25, 2026", status: "Resolved", dept: "Water Resources Dept", notes: "Contractor re-sealed pipeline junction. Verified by AI drone scan." },
]

export default function CitizenPage() {
  const [activeTab, setActiveTab] = useState<"search" | "map" | "complain" | "track">("search")
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Grievance form state
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [photoName, setPhotoName] = useState("")
  const [submittedId, setSubmittedId] = useState<string | null>(null)

  const [trackId, setTrackId] = useState("")
  const [trackResult, setTrackResult] = useState<any>(null)

  const filteredProjects = PROJECTS.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false
    if (query && !`${p.name} ${p.state} ${p.category} ${p.department}`.toLowerCase().includes(query.toLowerCase())) {
      return false
    }
    return true
  })

  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName || !description) return
    const id = `GRV-${Math.floor(9000 + Math.random() * 999)}`
    setSubmittedId(id)
  }

  const handleTrackComplaint = (e: React.FormEvent) => {
    e.preventDefault()
    const found = MOCK_COMPLAINTS.find((c) => c.id.toLowerCase() === trackId.trim().toLowerCase())
    if (found) {
      setTrackResult(found)
    } else {
      setTrackResult({
        id: trackId.toUpperCase(),
        project: "Public Infrastructure Road",
        category: "General Grievance",
        date: "Today",
        status: "Received & AI Processing",
        dept: "Public Works Department",
        notes: "Your complaint has been logged and sent to the district engineer.",
      })
    }
  }

  return (
    <DashboardLayout
      allowedRoles={["citizen", "super_admin", "government", "auditor", "vendor"]}
      title="Public Infrastructure Transparency & Citizen Grievance Portal"
      subtitle="Search any public project across India, view real-time AI transparency ratings, inspect verified budget allocations, and submit geo-tagged public grievances."
    >
      {/* Public KPIs Banner */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Public Money Tracked</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-primary">₹84,240 Cr</p>
          <span className="text-[10px] text-muted-foreground">Open Government Ledger</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Public AI Transparency Index</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-verified">94 / 100</p>
          <span className="text-[10px] text-verified font-medium">Verified Evidence Rating</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Citizen Reports Filed</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-cyan-400">26,800</p>
          <span className="text-[10px] text-muted-foreground">Community Supervised</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Issues Acted On</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-accent-teal">3,172</p>
          <span className="text-[10px] text-muted-foreground">Resolved by Govt Officers</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-1.5 text-xs font-semibold">
          {[
            { id: "search", label: "Search Public Projects", icon: Search },
            { id: "map", label: "Public Infrastructure Map", icon: MapPin },
            { id: "complain", label: "Submit Geo-Grievance", icon: AlertTriangle },
            { id: "track", label: "Track Grievance Status", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* TAB 1: Search Public Projects */}
      {activeTab === "search" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-border bg-card/60 p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects by city, state, or contractor name…"
                className="w-full rounded-xl border border-border bg-background/50 pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground">Category:</span>
              {["All", "Highways & Roads", "Water Resources", "Urban Infrastructure", "Health"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat === "All" ? null : cat)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs transition-all",
                    (cat === "All" && !selectedCategory) || selectedCategory === cat
                      ? "border-primary bg-primary/10 font-bold text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredProjects.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card/60 p-6 space-y-4 backdrop-blur shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <MapPin className="size-3 text-primary" /> {p.state} • {p.department}
                    </span>
                    <h3 className="font-display text-lg font-bold text-foreground mt-0.5">{p.name}</h3>
                  </div>

                  <span className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold border",
                    p.status === "verified" ? "bg-verified/15 text-verified border-verified/30" :
                    p.status === "pending" ? "bg-amber-500/15 text-amber-500 border-amber-500/30" :
                    "bg-destructive/15 text-destructive border-destructive/30"
                  )}>
                    {p.status === "verified" ? "Verified On-Track" : p.status === "pending" ? "Under AI Review" : "Flagged Issue"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Work Completed</span>
                    <span className="font-bold text-foreground">{p.progress}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Sanctioned Public Budget</span>
                    <span className="font-display font-bold text-sm text-foreground">{formatCrore(p.sanctioned)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-accent-teal/10 text-accent-teal border border-accent-teal/30 px-2 py-1 text-[11px] font-bold">
                      AI Transparency Score: 96%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Map */}
      {activeTab === "map" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-border bg-card/80 p-2 shadow-xl backdrop-blur">
            <ProjectMap />
          </div>
        </div>
      )}

      {/* TAB 3: Grievance Submission */}
      {activeTab === "complain" && (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
          <div className="rounded-3xl border border-border bg-card/80 p-6 sm:p-8 space-y-6 backdrop-blur shadow-2xl">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-500" /> Submit Public Infrastructure Grievance
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your report is analyzed by AI models against project satellite imagery & geotagged photos, and routed directly to the department chief engineer.
              </p>
            </div>

            {submittedId ? (
              <div className="rounded-2xl border border-verified/40 bg-verified/10 p-6 text-center space-y-3">
                <div className="grid size-12 place-items-center rounded-full bg-verified text-verified-foreground mx-auto">
                  <CheckCircle2 className="size-6" />
                </div>
                <h4 className="font-display text-base font-bold text-foreground">Grievance Successfully Logged</h4>
                <p className="text-xs text-muted-foreground">
                  Reference Tracking ID: <strong className="text-primary font-mono text-sm">{submittedId}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Your report has been queued for AI anomaly validation and transmitted to PWD Telangana.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedId(null)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitGrievance} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-muted-foreground">Which Project or Location?</label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Hyderabad Outer Ring Road near Exit 8"
                    className="mt-1 w-full rounded-xl border border-border bg-background/50 p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground">What Discrepancy Did You Notice?</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue in plain words (e.g. road surfacing stopped halfway, poor concrete quality, delayed drainage work)..."
                    className="mt-1 w-full rounded-xl border border-border bg-background/50 p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground">Attach Photo / Evidence File (Optional)</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={photoName}
                      onChange={(e) => setPhotoName(e.target.value)}
                      placeholder="e.g. Pothole_Photo_Aug2026.jpg"
                      className="flex-1 rounded-xl border border-border bg-background/50 p-2.5 text-xs text-foreground focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoName("Pothole_SitePhoto_Geotag.jpg")}
                      className="rounded-xl border border-border bg-card px-3 py-2.5 font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <Camera className="size-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg hover:bg-primary/90"
                >
                  Transmit Grievance to Sentinel AI Engine
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Track Grievance */}
      {activeTab === "track" && (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">
          <div className="rounded-3xl border border-border bg-card/80 p-6 sm:p-8 space-y-4 backdrop-blur shadow-2xl">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="size-5 text-primary" /> Track Grievance Status
            </h3>
            <p className="text-xs text-muted-foreground">Enter your 7-character grievance tracking reference code</p>

            <form onSubmit={handleTrackComplaint} className="flex gap-2">
              <input
                type="text"
                required
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="e.g. GRV-9428"
                className="flex-1 rounded-xl border border-border bg-background/50 p-3 font-mono text-sm text-foreground focus:outline-none"
              />
              <button type="submit" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">
                Search ID
              </button>
            </form>

            {trackResult && (
              <div className="rounded-2xl border border-border bg-background p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary">{trackResult.id}</span>
                  <span className="rounded-full bg-verified/10 text-verified border border-verified/30 px-2.5 py-0.5 text-[10px] font-bold">
                    {trackResult.status}
                  </span>
                </div>
                <h4 className="font-bold text-foreground text-sm">{trackResult.project}</h4>
                <p className="text-muted-foreground">Category: {trackResult.category} • Department: {trackResult.dept}</p>
                <p className="bg-card p-2.5 rounded-lg border border-border text-foreground font-medium">
                  {trackResult.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
