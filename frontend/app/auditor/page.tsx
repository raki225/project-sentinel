"use client"

import React, { useState } from "react"
import { DashboardLayout } from "@/components/sentinel/dashboard-layout"
import {
  ScanSearch,
  ShieldAlert,
  CalendarDays,
  FileText,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Eye,
  Camera,
  Layers,
  MapPin,
  Download,
  Check,
  X,
  FileCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

const MOCK_ALERTS = [
  { id: "ALT-901", project: "Musirabad Elevated Flyover", risk: 94, category: "Duplicate Invoice Detection", details: "Line item #4 matching invoice submitted to Karnataka PWD in 2025", status: "Open Investigation", vendor: "Megha Engineering" },
  { id: "ALT-902", project: "Godavari Drinking Water Pipeline", risk: 82, category: "Geotag Timestamp Anomaly", details: "Site photo EXIF location recorded 12km outside sanctioned pipeline corridor", status: "Open Investigation", vendor: "L&T Heavy Engineering" },
  { id: "ALT-903", project: "Outer Ring Road Phase II", risk: 45, category: "Material Benchmark Discrepancy", details: "Bitumen grade B60 priced 14% above state schedule of rates", status: "Under Review", vendor: "ABC Infrastructure Ltd" },
]

export default function AuditorPage() {
  const [activeTab, setActiveTab] = useState<"alerts" | "evidence" | "calendar" | "reports">("alerts")
  const [alerts, setAlerts] = useState(MOCK_ALERTS)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [reportGenerated, setReportGenerated] = useState(false)

  const handleResolveAlert = (id: string, action: "Confirm Fraud" | "Dismiss Alert") => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: action === "Confirm Fraud" ? "Confirmed Fraud" : "Dismissed" } : a))
    setSelectedAlert(null)
  }

  return (
    <DashboardLayout
      allowedRoles={["auditor"]}
      title="Forensic Audit & Anti-Fraud Inspection Suite"
      subtitle="Review AI neural mesh fraud alerts, execute dual evidence side-by-side comparisons, schedule field inspections, and generate certified audit reports."
    >
      {/* Audit KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pending Audits</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-foreground">14 Audits</p>
          <span className="text-[10px] text-muted-foreground">CAG & PWD Division</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active Fraud Alerts</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-destructive">6 Critical</p>
          <span className="text-[10px] text-destructive font-medium">Neural Mesh Flagged</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">High Risk Projects</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-amber-500">4 Projects</p>
          <span className="text-[10px] text-muted-foreground">Score &gt; 80 / 100</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Completed Site Inspections</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-verified">28 Verified</p>
          <span className="text-[10px] text-verified font-medium">Geotagged & Signed</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Audit Accuracy</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-cyan-400">99.2%</p>
          <span className="text-[10px] text-muted-foreground">AI Neural Benchmark</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 text-xs font-semibold">
          {[
            { id: "alerts", label: "Fraud Alerts Queue", icon: ShieldAlert, badge: alerts.filter(a => a.status.includes("Open")).length },
            { id: "evidence", label: "Dual Evidence Comparator", icon: ScanSearch },
            { id: "calendar", label: "Field Inspection Calendar", icon: CalendarDays },
            { id: "reports", label: "Certified Audit Studio", icon: FileText },
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
                {tab.badge ? (
                  <span className="rounded-full bg-destructive text-destructive-foreground px-1.5 py-0.2 text-[10px]">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {/* TAB 1: Fraud Alerts Queue */}
      {activeTab === "alerts" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid gap-4 sm:grid-cols-3">
            {alerts.map((alt) => (
              <div key={alt.id} className="rounded-2xl border border-border bg-card/60 p-5 space-y-3 backdrop-blur shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground">{alt.id} • {alt.vendor}</span>
                    <h3 className="font-display text-sm font-bold text-foreground mt-0.5">{alt.project}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Risk Score</span>
                    <span className={cn("font-display text-lg font-bold", alt.risk > 75 ? "text-destructive" : "text-amber-500")}>
                      {alt.risk}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-2.5 text-xs text-destructive font-semibold">
                  {alt.category}
                </div>

                <p className="text-xs text-muted-foreground">{alt.details}</p>

                <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">{alt.status}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedAlert(alt)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Inspect Findings
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Dual Evidence Comparator */}
      {activeTab === "evidence" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4 backdrop-blur">
            <h3 className="font-display text-base font-bold text-foreground">Dual Evidence Side-by-Side Comparator</h3>
            <p className="text-xs text-muted-foreground">Compare official government sanction baseline vs contractor submitted evidence</p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-bold text-foreground text-xs uppercase">Sanctioned Baseline (PWD Rate & Blueprint)</span>
                  <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-mono">SPECIFICATION</span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p><strong>Approved Material:</strong> Grade M40 Concrete & High-Tensile Steel</p>
                  <p><strong>Sanctioned Unit Cost:</strong> ₹6,200 per cubic meter</p>
                  <p><strong>Approved Thickness:</strong> 350 mm Pavement Layer</p>
                  <div className="h-32 rounded-lg bg-muted grid place-items-center border border-border text-[11px]">
                    [Approved Architectural CAD Blueprint Blueprint.dwg]
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-bold text-destructive text-xs uppercase">Submitted Evidence (Contractor Upload)</span>
                  <span className="rounded bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-mono">ANOMALY DETECTED</span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p><strong>Claimed Material:</strong> Grade M30 Concrete (Lower Grade)</p>
                  <p><strong>Billed Unit Cost:</strong> ₹7,800 per cubic meter (+25.8% Inflation)</p>
                  <p><strong>Scanned Thickness:</strong> 328 mm (-22mm Discrepancy)</p>
                  <div className="h-32 rounded-lg bg-destructive/10 border border-destructive/40 grid place-items-center text-[11px] text-destructive font-semibold">
                    [Geotagged Site Drone Scan — Anomaly Overlay]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Field Inspection Calendar */}
      {activeTab === "calendar" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3 backdrop-blur">
            <h3 className="font-display text-base font-bold text-foreground">Field Inspection Calendar & Dispatch</h3>
            <p className="text-xs text-muted-foreground">Scheduled site visits by certified CAG and PWD technical auditors</p>

            <div className="space-y-2 text-xs">
              {[
                { date: "Aug 5, 2026", site: "Musirabad Elevated Flyover", inspector: "Ananya Sharma (CAG Chief Auditor)", purpose: "Concrete Grade Quality Check", status: "Scheduled" },
                { date: "Aug 8, 2026", site: "Godavari Pipeline Sector 4", inspector: "Er. R. K. Swamy", purpose: "Pipeline Trenching & Geotag Audit", status: "Confirmed" },
              ].map((ev, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                  <div>
                    <span className="font-bold text-primary">{ev.date}</span>
                    <h4 className="font-bold text-foreground text-sm">{ev.site}</h4>
                    <p className="text-muted-foreground">Inspector: {ev.inspector} • Purpose: {ev.purpose}</p>
                  </div>
                  <span className="rounded-full bg-verified/10 text-verified border border-verified/30 px-3 py-1 text-xs font-bold">
                    {ev.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Certified Audit Studio */}
      {activeTab === "reports" && (
        <div className="space-y-4 animate-in fade-in duration-300 max-w-2xl mx-auto">
          <div className="rounded-3xl border border-border bg-card/80 p-6 sm:p-8 space-y-4 backdrop-blur shadow-2xl">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-primary" /> Certified Audit Report Studio
            </h3>
            <p className="text-xs text-muted-foreground">Generate digital certified audit certificates with AI findings summary and official inspector signature.</p>

            {reportGenerated && (
              <div className="rounded-xl border border-verified/40 bg-verified/10 p-3 text-xs text-verified flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                <span>Certified Audit Report generated & signed cryptographically! Ready for download.</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground">Target Audit Project</label>
                <select className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground">
                  <option>Musirabad Elevated Flyover Corridor (High Risk)</option>
                  <option>Godavari Drinking Water Pipeline</option>
                  <option>Hyderabad Outer Ring Road Phase II</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Audit Opinion / Summary Finding</label>
                <textarea
                  placeholder="e.g. Audit reveals material specification discrepancy. Recommending holding 15% milestone disbursement pending contractor rectification..."
                  className="mt-1 w-full h-24 rounded-xl border border-border bg-background p-2.5 text-xs text-foreground"
                />
              </div>

              <button
                type="button"
                onClick={() => setReportGenerated(true)}
                className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg hover:bg-primary/90"
              >
                Generate & Sign Certified Audit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in">
            <h3 className="font-display text-lg font-bold text-foreground">{selectedAlert.category}</h3>
            <p className="text-xs text-muted-foreground mt-1">Project: {selectedAlert.project} • Contractor: {selectedAlert.vendor}</p>

            <div className="mt-4 rounded-xl border border-border bg-background p-3 text-xs space-y-2">
              <p><strong>Neural Mesh Evidence:</strong> {selectedAlert.details}</p>
              <p><strong>Calculated Risk Score:</strong> <span className="text-destructive font-bold">{selectedAlert.risk} / 100</span></p>
            </div>

            <div className="mt-6 flex justify-end gap-2 text-xs">
              <button onClick={() => setSelectedAlert(null)} className="rounded-xl border border-border px-4 py-2 font-semibold">Close</button>
              <button onClick={() => handleResolveAlert(selectedAlert.id, "Dismiss Alert")} className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-muted">Dismiss Alert</button>
              <button onClick={() => handleResolveAlert(selectedAlert.id, "Confirm Fraud")} className="rounded-xl bg-destructive px-4 py-2 font-semibold text-destructive-foreground hover:bg-destructive/90">Confirm Fraud Flag</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
