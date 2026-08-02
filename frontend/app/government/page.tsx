"use client"

import React, { useState } from "react"
import dynamic from "next/dynamic"
import { DashboardLayout } from "@/components/sentinel/dashboard-layout"
import { STATES, formatCrore } from "@/lib/sentinel-data"
import {
  Landmark,
  Building2,
  ScanSearch,
  MapPin,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  Eye,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ProjectMap = dynamic(() => import("@/components/sentinel/project-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[300px] place-items-center rounded-xl border border-border bg-card/40">
      <span className="text-xs text-muted-foreground">Loading District Infrastructure Map…</span>
    </div>
  ),
})

const MOCK_DEPT_PROJECTS = [
  { id: "PRJ-TS-001", name: "Hyderabad Outer Ring Road Phase II", category: "Highways & Roads", budget: 42000000000, verified: 36000000000, progress: 85, status: "verified", riskScore: 12, contractor: "ABC Infrastructure Ltd" },
  { id: "PRJ-TS-002", name: "Godavari Drinking Water Pipeline", category: "Water Resources", budget: 18500000000, verified: 14200000000, progress: 76, status: "pending", riskScore: 48, contractor: "L&T Heavy Engineering" },
  { id: "PRJ-TS-003", name: "Smart City AI Traffic Surveillance", category: "Urban Infrastructure", budget: 6500000000, verified: 6500000000, progress: 100, status: "verified", riskScore: 5, contractor: "TATA Projects" },
  { id: "PRJ-TS-004", name: "Musirabad Elevated Flyover Corridor", category: "Urban Transport", budget: 9800000000, verified: 5200000000, progress: 54, status: "flagged", riskScore: 82, contractor: "Megha Engineering" },
]

export default function GovernmentPage() {
  const [activeTab, setActiveTab] = useState<"projects" | "approvals" | "map" | "inspections">("projects")
  const [approvals, setApprovals] = useState([
    { id: "AP-01", project: "Godavari Pipeline M3", doc: "Invoice_LineItems_M3.pdf", vendor: "L&T Heavy Engineering", aiScore: 92, aiNotes: "Math verified, material benchmark matches PWD rates", status: "Pending Review" },
    { id: "AP-02", project: "Musirabad Flyover Corridor", doc: "Concrete_Grade_Cert_L4.pdf", vendor: "Megha Engineering", aiScore: 44, aiNotes: "WARNING: Geotag timestamp mismatches drone scan by 4 days", status: "Needs Clarification" },
  ])
  const [selectedApproval, setSelectedApproval] = useState<any>(null)
  const [dispatchAuditor, setDispatchAuditor] = useState(false)

  const handleApprove = (id: string) => {
    setApprovals(approvals.map((a) => (a.id === id ? { ...a, status: "Approved" } : a)))
    setSelectedApproval(null)
  }

  const handleReject = (id: string) => {
    setApprovals(approvals.map((a) => (a.id === id ? { ...a, status: "Rejected" } : a)))
    setSelectedApproval(null)
  }

  return (
    <DashboardLayout
      allowedRoles={["government"]}
      title="Departmental Command — Public Works & Infrastructure"
      subtitle="Monitoring PWD projects, reviewing AI verification findings, approving milestone disbursements, and dispatching field inspectors."
    >
      {/* Department KPI Banner */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Department Budget</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-foreground">₹7,680 Cr</p>
          <span className="text-[10px] text-muted-foreground">4 Active Mega Contracts</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Health Index</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-verified">92%</p>
          <span className="text-[10px] text-verified font-medium">Above State Average</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">On-Time Milestones</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-primary">84%</p>
          <span className="text-[10px] text-muted-foreground">16 of 19 Milestones</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pending AI Approvals</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-amber-500">{approvals.filter(a => a.status === "Pending Review").length}</p>
          <span className="text-[10px] text-amber-500 font-medium">Requires Officer Review</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Field Inspections</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-cyan-400">12 Assigned</p>
          <span className="text-[10px] text-muted-foreground">CAG & PWD Auditors</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 text-xs font-semibold">
          {[
            { id: "projects", label: "Department Projects & Specs", icon: Building2 },
            { id: "approvals", label: "AI Findings & Document Queue", icon: ScanSearch, badge: approvals.length },
            { id: "map", label: "District Map & Density", icon: MapPin },
            { id: "inspections", label: "Auditor Field Dispatch", icon: Users },
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
                {tab.badge !== undefined && (
                  <span className={cn("rounded-full px-1.5 py-0.2 text-[10px]", active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => alert("Department Audit Summary PDF Report generated and ready for download.")}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:border-primary/40"
        >
          <Download className="size-4 text-primary" />
          <span>Export Department Report</span>
        </button>
      </div>

      {/* TAB 1: Projects Table */}
      {activeTab === "projects" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid gap-4 sm:grid-cols-2">
            {MOCK_DEPT_PROJECTS.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card/60 p-5 space-y-3 backdrop-blur shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{p.category}</span>
                    <h3 className="font-display text-base font-bold text-foreground mt-0.5">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">Contractor: <span className="text-foreground font-medium">{p.contractor}</span></p>
                  </div>
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                    p.status === "verified" ? "bg-verified/10 text-verified border-verified/30" :
                    p.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/30" :
                    "bg-destructive/10 text-destructive border-destructive/30"
                  )}>
                    {p.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Completion Progress</span>
                    <span className="font-bold text-foreground">{p.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Sanctioned Budget</span>
                    <span className="font-bold text-foreground">{formatCrore(p.budget)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">AI Risk Rating</span>
                    <span className={cn("font-bold", p.riskScore > 50 ? "text-destructive" : "text-verified")}>
                      {p.riskScore} / 100
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AI Approvals Queue */}
      {activeTab === "approvals" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4 backdrop-blur">
            <h3 className="font-display text-base font-bold text-foreground">AI Pre-Validated Document Approval Queue</h3>
            <p className="text-xs text-muted-foreground">Side-by-side AI fraud verification results for contractor submissions</p>

            <div className="space-y-3">
              {approvals.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground">{item.id} • {item.project}</span>
                      <h4 className="font-display text-sm font-bold text-foreground">{item.doc}</h4>
                      <span className="text-xs text-muted-foreground">Submitted by {item.vendor}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">AI Confidence Score</span>
                        <span className={cn("font-display text-lg font-bold", item.aiScore > 75 ? "text-verified" : "text-amber-500")}>
                          {item.aiScore}%
                        </span>
                      </div>

                      {item.status === "Pending Review" || item.status === "Needs Clarification" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            className="rounded-lg bg-verified px-3 py-1.5 text-xs font-semibold text-verified-foreground shadow-sm hover:bg-verified/90"
                          >
                            Approve Document
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(item.id)}
                            className="rounded-lg bg-destructive/10 text-destructive border border-destructive/30 px-3 py-1.5 text-xs font-semibold hover:bg-destructive/20"
                          >
                            Reject & Request Fix
                          </button>
                        </div>
                      ) : (
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                          Status: {item.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground flex items-center gap-2">
                    <ScanSearch className="size-4 text-primary shrink-0" />
                    <span>AI Note: {item.aiNotes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: District Map */}
      {activeTab === "map" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-border bg-card/80 p-2 shadow-xl backdrop-blur">
            <ProjectMap />
          </div>
        </div>
      )}

      {/* TAB 4: Auditor Field Dispatch */}
      {activeTab === "inspections" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">Dispatch Forensic Inspector to Site</h3>
                <p className="text-xs text-muted-foreground">Schedule physical field audit for high-risk or flagged project milestones</p>
              </div>
              <button
                type="button"
                onClick={() => setDispatchAuditor(true)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                + Schedule New Field Audit
              </button>
            </div>

            <div className="rounded-xl border border-border bg-background/50 p-4 text-xs space-y-3">
              <div className="flex justify-between items-center font-bold text-foreground">
                <span>Active Field Inspection #INSP-2026-09</span>
                <span className="text-verified">Scheduled for Aug 5, 2026</span>
              </div>
              <p className="text-muted-foreground">Assigned Inspector: <strong className="text-foreground">Ananya Sharma (CAG Auditor)</strong></p>
              <p className="text-muted-foreground">Target Site: <strong className="text-foreground">Musirabad Elevated Flyover Corridor</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {dispatchAuditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in">
            <h3 className="font-display text-lg font-bold text-foreground">Dispatch Field Inspector</h3>
            <p className="mt-1 text-xs text-muted-foreground">Select project and assign certified CAG forensic auditor</p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground">Target Project</label>
                <select className="mt-1 w-full rounded-xl border border-border bg-background p-2 text-sm text-foreground">
                  <option>Musirabad Elevated Flyover Corridor</option>
                  <option>Godavari Drinking Water Pipeline</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-muted-foreground">Select Inspector</label>
                <select className="mt-1 w-full rounded-xl border border-border bg-background p-2 text-sm text-foreground">
                  <option>Ananya Sharma (Chief Forensic Auditor)</option>
                  <option>R. K. Swamy (PWD QA Engineer)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setDispatchAuditor(false)} className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground">Cancel</button>
              <button onClick={() => { setDispatchAuditor(false); alert("Field audit dispatch order transmitted."); }} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Dispatch Inspector</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
