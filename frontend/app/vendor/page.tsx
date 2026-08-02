"use client"

import React, { useState } from "react"
import { DashboardLayout } from "@/components/sentinel/dashboard-layout"
import { formatCrore } from "@/lib/sentinel-data"
import {
  Building2,
  UploadCloud,
  FolderKanban,
  CreditCard,
  ScanSearch,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Camera,
  Video,
  FileCheck,
  Clock,
  ArrowUpRight,
  Send,
  MessageSquare,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function VendorPage() {
  const [activeTab, setActiveTab] = useState<"contracts" | "upload" | "ai" | "payments">("contracts")
  
  // Upload Form State
  const [docType, setDocType] = useState("Geotagged Site Photo")
  const [fileName, setFileName] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Submissions state
  const [submissions, setSubmissions] = useState([
    { id: "SUB-801", type: "Invoice PDF", name: "INV_ORR_Phase2_M4.pdf", date: "Aug 1, 2026", status: "Verified & Approved", score: 98, note: "All line items matched PWD rates" },
    { id: "SUB-802", type: "Geotagged Photo", name: "Bridge_Pillar_Geotag_L3.jpg", date: "Jul 28, 2026", status: "Verified & Approved", score: 95, note: "Geotag match: Lat 17.3850, Long 78.4867" },
    { id: "SUB-803", type: "Drone Footage", name: "Drone_Scan_ORR_KM24.mp4", date: "Jul 25, 2026", status: "Flagged — Needs Clarification", score: 52, note: "AI Alert: Pavement thickness scan deviates by 2.1cm from specification" },
  ])

  const [responseText, setResponseText] = useState("")
  const [selectedFlaggedId, setSelectedFlaggedId] = useState<string | null>(null)

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileName) return
    setUploading(true)

    setTimeout(() => {
      setUploading(false)
      setUploadSuccess(true)
      const newSub = {
        id: `SUB-${Math.floor(100 + Math.random() * 900)}`,
        type: docType,
        name: fileName,
        date: "Just now",
        status: "Under AI Pre-Verification",
        score: 94,
        note: "AI pre-check passed geotag & arithmetic verification",
      }
      setSubmissions([newSub, ...submissions])
      setFileName("")
      setTimeout(() => setUploadSuccess(false), 3000)
    }, 1200)
  }

  const handleRespondToFlag = (id: string) => {
    if (!responseText) return
    setSubmissions(submissions.map(s => s.id === id ? { ...s, status: "Clarification Submitted to Auditor", note: `Contractor Note: ${responseText}` } : s))
    setSelectedFlaggedId(null)
    setResponseText("")
  }

  return (
    <DashboardLayout
      allowedRoles={["vendor"]}
      title="Infrastructure Partner Portal — Active Contracts Execution"
      subtitle="Upload site proof evidence, track real-time AI document verification, respond to auditor findings, and track invoice disbursements."
    >
      {/* Contract KPIs Banner */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assigned Contracts</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-foreground">4 Active</p>
          <span className="text-[10px] text-muted-foreground">ABC Infrastructure Ltd</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Contract Value</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-primary">₹1,450 Cr</p>
          <span className="text-[10px] text-muted-foreground">Sanctioned Public Funds</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Verified Disbursements</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-verified">₹420 Cr</p>
          <span className="text-[10px] text-verified font-medium">Released to Bank</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pending Invoices</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-amber-500">₹65 Cr</p>
          <span className="text-[10px] text-amber-500 font-medium">Under PWD Review</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">AI Pass Rate</span>
          <p className="mt-1 font-display text-2xl font-extrabold text-accent-teal">96%</p>
          <span className="text-[10px] text-muted-foreground">Geotag & Math Verified</span>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 text-xs font-semibold">
          {[
            { id: "contracts", label: "Assigned Contracts & Milestones", icon: FolderKanban },
            { id: "upload", label: "Evidence Upload Center", icon: UploadCloud },
            { id: "ai", label: "AI Verification & Findings", icon: ScanSearch, badge: submissions.filter(s => s.status.includes("Flagged")).length },
            { id: "payments", label: "Disbursement & Invoices", icon: CreditCard },
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

      {/* TAB 1: Assigned Contracts */}
      {activeTab === "contracts" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: "Hyderabad Outer Ring Road Expansion Phase II", num: "ORR-TS-2024", val: "₹850 Cr", status: "On Schedule", pct: 85, nextM: "Pavement Layering KM 24-32" },
              { name: "Medak District Highway Bypass", num: "HWY-MD-2025", val: "₹380 Cr", status: "Milestone Pending", pct: 60, nextM: "Bridge Concrete Quality Check" },
              { name: "Warangal Smart City Flyover Pillar", num: "FLY-WG-2025", val: "₹220 Cr", status: "On Schedule", pct: 92, nextM: "Final Structural Load Cert" },
            ].map((c, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-card/60 p-5 space-y-3 backdrop-blur shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground">{c.num}</span>
                    <h3 className="font-display text-base font-bold text-foreground mt-0.5">{c.name}</h3>
                  </div>
                  <span className="rounded-full bg-verified/10 text-verified border border-verified/30 px-2.5 py-0.5 text-[10px] font-bold">
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Execution Progress</span>
                    <span className="font-bold text-foreground">{c.pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 text-xs flex justify-between">
                  <span className="text-muted-foreground">Contract Value: <strong className="text-foreground">{c.val}</strong></span>
                  <span className="text-primary font-medium">Next: {c.nextM}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Upload Center */}
      {activeTab === "upload" && (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
          <div className="rounded-3xl border border-border bg-card/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <UploadCloud className="size-5 text-primary" /> Contractor Document & Site Evidence Upload
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Upload geotagged field photos, drone video files, invoice PDFs, or milestone completion certificates for real-time AI pre-validation.
              </p>
            </div>

            {uploadSuccess && (
              <div className="rounded-xl border border-verified/40 bg-verified/10 p-3 text-xs text-verified flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                <span>Evidence document uploaded successfully! AI pre-verification initiated.</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground">Document Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                  {[
                    { id: "Geotagged Site Photo", icon: Camera },
                    { id: "Drone Footage Video", icon: Video },
                    { id: "Invoice Line Item PDF", icon: FileText },
                    { id: "Completion Certificate", icon: FileCheck },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDocType(t.id)}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all",
                        docType === t.id
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <t.icon className="size-4 mb-1" />
                      <span className="text-[10px]">{t.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">File Name / File Attachment</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. Geotag_ORR_BridgePillar_KM24.jpg or INV-9402.pdf"
                  className="mt-1 w-full rounded-xl border border-border bg-background/50 p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Drag Drop Mock Container */}
              <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors bg-background/30">
                <UploadCloud className="mx-auto size-8 text-muted-foreground mb-2" />
                <p className="font-semibold text-foreground">Click to select files or drag & drop</p>
                <p className="text-[11px] text-muted-foreground mt-1">Supports JPG, PNG, MP4, PDF up to 200MB (Geotag EXIF headers auto-checked)</p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? "Running AI Geotag & Math Check…" : "Submit Evidence to Government Ledger"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: AI Verification Results */}
      {activeTab === "ai" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4 backdrop-blur">
            <h3 className="font-display text-base font-bold text-foreground">AI Verification Results & Auditor Feedback</h3>

            <div className="space-y-3">
              {submissions.map((sub) => (
                <div key={sub.id} className="rounded-xl border border-border bg-background/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground">{sub.id} • {sub.type}</span>
                      <h4 className="font-display text-sm font-bold text-foreground">{sub.name}</h4>
                    </div>
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                      sub.status.includes("Verified") ? "bg-verified/10 text-verified border-verified/30" :
                      sub.status.includes("Flagged") ? "bg-destructive/10 text-destructive border-destructive/30" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/30"
                    )}>
                      {sub.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground bg-card p-2.5 rounded-lg border border-border">
                    <strong>AI Analysis Note:</strong> {sub.note}
                  </p>

                  {sub.status.includes("Flagged") && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedFlaggedId(sub.id)}
                        className="rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold hover:bg-amber-500/20"
                      >
                        Respond to Auditor Query
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Disbursements */}
      {activeTab === "payments" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur space-y-3">
            <h3 className="font-display text-base font-bold text-foreground">Disbursement & Milestone Billing History</h3>
            <p className="text-xs text-muted-foreground">Track government treasury release status & bank credit timestamps</p>

            <div className="overflow-hidden rounded-xl border border-border bg-background/50">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Invoice ID</th>
                    <th className="p-3">Project</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">AI Verification</th>
                    <th className="p-3">Treasury Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 font-mono font-semibold">INV-ORR-M4</td>
                    <td className="p-3">Outer Ring Road Expansion</td>
                    <td className="p-3 font-bold text-foreground">₹45.0 Cr</td>
                    <td className="p-3 text-verified font-medium">100% Passed</td>
                    <td className="p-3 text-verified font-bold">Credited to SBI Account</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold">INV-FLY-M2</td>
                    <td className="p-3">Warangal Flyover</td>
                    <td className="p-3 font-bold text-foreground">₹20.0 Cr</td>
                    <td className="p-3 text-verified font-medium">96% Passed</td>
                    <td className="p-3 text-amber-500 font-bold">In PWD Treasury Queue</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {selectedFlaggedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in">
            <h3 className="font-display text-lg font-bold text-foreground">Respond to Auditor Query</h3>
            <p className="mt-1 text-xs text-muted-foreground">Provide contractor explanation or re-upload corrected technical specs</p>

            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="e.g. Laser scanner calibration offset corrected. Pavement thickness complies with IRC standards..."
              className="mt-3 w-full h-28 rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-none"
            />

            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button onClick={() => setSelectedFlaggedId(null)} className="rounded-xl border border-border px-4 py-2 font-semibold">Cancel</button>
              <button onClick={() => handleRespondToFlag(selectedFlaggedId)} className="rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground">Submit Response</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
