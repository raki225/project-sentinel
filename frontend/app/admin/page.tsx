"use client"

import React, { useState } from "react"
import dynamic from "next/dynamic"
import { DashboardLayout } from "@/components/sentinel/dashboard-layout"
import { STATES, CATEGORIES, FUND_TIMELINE, formatCrore } from "@/lib/sentinel-data"
import {
  Building2,
  Users,
  ShieldAlert,
  Sparkles,
  Database,
  FileCode,
  Landmark,
  Layers,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Cpu,
  RefreshCw,
  Server,
  Activity,
  UserPlus,
  Sliders,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ProjectMap = dynamic(() => import("@/components/sentinel/project-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[320px] place-items-center rounded-xl border border-border bg-card/40">
      <span className="text-xs text-muted-foreground">Loading National Infrastructure Map…</span>
    </div>
  ),
})

// Sample users for user management tab
const MOCK_USERS = [
  { id: "usr-01", name: "Dr. Rajesh Kumar", email: "admin@sentinel.gov", role: "super_admin", dept: "Cabinet Secretariat", status: "Active", lastSeen: "Just now" },
  { id: "usr-02", name: "Er. Vikram Reddy", email: "pwd.hyderabad@gov.in", role: "government", dept: "PWD Telangana", status: "Active", lastSeen: "5m ago" },
  { id: "usr-03", name: "Suresh Mehta", email: "vendor@abcinfra.com", role: "vendor", dept: "ABC Infra Ltd", status: "Active", lastSeen: "12m ago" },
  { id: "usr-04", name: "Ananya Sharma", email: "auditor@sentinel.gov", role: "auditor", dept: "CAG Forensic Audit", status: "Active", lastSeen: "1h ago" },
  { id: "usr-05", name: "Aarav Patel", email: "citizen@example.com", role: "citizen", dept: "Public Transparency", status: "Active", lastSeen: "3h ago" },
  { id: "usr-06", name: "K. Satyanarayana", email: "water.board@gov.in", role: "government", dept: "Water Resources", status: "Active", lastSeen: "4h ago" },
  { id: "usr-07", name: "Larsen & Infra", email: "contracts@ltinfra.com", role: "vendor", dept: "L&T Construction", status: "Active", lastSeen: "1d ago" },
]

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<"control" | "users" | "ai" | "logs">("control")
  const [users, setUsers] = useState(MOCK_USERS)
  const [userQuery, setUserQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)

  // New user form state
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState("government")
  const [newDept, setNewDept] = useState("Public Works Department")

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newEmail) return
    const created = {
      id: `usr-${Math.random().toString(36).substring(2, 6)}`,
      name: newName,
      email: newEmail,
      role: newRole,
      dept: newDept,
      status: "Active",
      lastSeen: "Just now",
    }
    setUsers([created, ...users])
    setShowCreateModal(false)
    setNewName("")
    setNewEmail("")
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(userQuery.toLowerCase())
  )

  return (
    <DashboardLayout
      allowedRoles={["super_admin"]}
      title="National Super Admin Command & AI Oversight Center"
      subtitle="Complete platform governance, multi-role user management, AI model performance monitoring, and live national infrastructure surveillance."
    >
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {[
          { label: "Total Projects", val: "1,284", sub: "National Registry", color: "text-foreground" },
          { label: "Active Execution", val: "942", sub: "73.3% On Schedule", color: "text-primary" },
          { label: "High Risk Flags", val: "18", sub: "Requires Action", color: "text-destructive" },
          { label: "AI Fraud Alerts", val: "7", sub: "Neural Mesh Detected", color: "text-amber-500" },
          { label: "Departments", val: "14", sub: "Gov Entities", color: "text-accent-teal" },
          { label: "Active Vendors", val: "328", sub: "Verified Builders", color: "text-verified" },
          { label: "Public Citizens", val: "45.2K", sub: "Active Portal", color: "text-cyan-400" },
          { label: "Pending Reviews", val: "42", sub: "In Queue", color: "text-purple-400" },
        ].map((stat, idx) => (
          <div key={idx} className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
            <p className={cn("mt-1 font-display text-2xl font-extrabold tracking-tight", stat.color)}>{stat.val}</p>
            <span className="text-[10px] text-muted-foreground/80 mt-0.5 block">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Tab Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 text-xs font-semibold">
          {[
            { id: "control", label: "National Command & Live Map", icon: Landmark },
            { id: "users", label: "User & Role Management", icon: Users, count: users.length },
            { id: "ai", label: "AI Models & System Health", icon: Cpu },
            { id: "logs", label: "Platform Audit Logs", icon: FileCode },
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
                {tab.count !== undefined && (
                  <span className={cn("rounded-full px-1.5 py-0.2 text-[10px]", active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {activeTab === "users" && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <UserPlus className="size-4" />
            <span>Create Platform User</span>
          </button>
        )}
      </div>

      {/* TAB 1: National Command & Live India Map */}
      {activeTab === "control" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-card/60 p-4">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">Live Infrastructure Geographic Mesh</h3>
                  <p className="text-xs text-muted-foreground">State-wise project density, financial allocation, and risk alerts across India</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-verified">
                  <Radio className="size-3 text-verified animate-pulse" />
                  <span>Real-time Bhuvan Sync</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card/80 p-2 shadow-xl backdrop-blur">
                <ProjectMap />
              </div>
            </div>

            {/* State-wise Spend Breakdown */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card/60 p-4">
                <h3 className="font-display text-base font-bold text-foreground">State-Wise Budget Distribution</h3>
                <p className="text-xs text-muted-foreground">Sanctioned vs Verified public funds by state</p>

                <div className="mt-4 space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {[
                    { name: "Telangana", code: "TS", sanctioned: 185000000000, verified: 156000000000, projectCount: 242 },
                    { name: "Maharashtra", code: "MH", sanctioned: 242000000000, verified: 210000000000, projectCount: 384 },
                    { name: "Karnataka", code: "KA", sanctioned: 145000000000, verified: 122000000000, projectCount: 198 },
                    { name: "Tamil Nadu", code: "TN", sanctioned: 168000000000, verified: 144000000000, projectCount: 215 },
                    { name: "Gujarat", code: "GJ", sanctioned: 124000000000, verified: 110000000000, projectCount: 165 },
                  ].map((st) => {
                    const pct = Math.round((st.verified / st.sanctioned) * 100)
                    return (
                      <div key={st.code} className="rounded-xl border border-border bg-background/50 p-3 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-foreground">{st.name} ({st.code})</span>
                          <span className="text-primary">{formatCrore(st.sanctioned)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{st.projectCount} Projects</span>
                          <span className="text-verified font-medium">{pct}% Verified ({formatCrore(st.verified)})</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: User & Role Management */}
      {activeTab === "users" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search users by name, email, role or department…"
                className="w-full rounded-xl border border-border bg-background/50 pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Showing {filteredUsers.length} of {users.length} registered system accounts
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card/60 shadow-xl backdrop-blur">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">User Name & ID</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role Badge</th>
                  <th className="p-4">Department / Org</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Activity</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-semibold text-foreground">
                      <div>{u.name}</div>
                      <span className="text-[10px] font-mono text-muted-foreground">{u.id}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-primary/10 border border-primary/30 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{u.dept}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-verified font-semibold">
                        <span className="size-1.5 rounded-full bg-verified" /> {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono">{u.lastSeen}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Role configuration options opened for ${u.name}`)}
                        className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-primary/40"
                      >
                        Edit RBAC
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AI Model & System Health */}
      {activeTab === "ai" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-foreground">AI Vision Anomaly Model</span>
                <span className="rounded-full bg-verified/10 text-verified px-2 py-0.5 text-[10px] font-bold">HEALTHY</span>
              </div>
              <p className="text-2xl font-extrabold text-primary">98.4% Accuracy</p>
              <p className="text-xs text-muted-foreground">Geotagged site photo vs invoice cross-matching engine</p>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-foreground">Fraud Neural Mesh</span>
                <span className="rounded-full bg-verified/10 text-verified px-2 py-0.5 text-[10px] font-bold">ACTIVE</span>
              </div>
              <p className="text-2xl font-extrabold text-accent-teal">240ms Latency</p>
              <p className="text-xs text-muted-foreground">Line-item inflation & price benchmark classifier</p>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-foreground">DB Sync & Cache</span>
                <span className="rounded-full bg-verified/10 text-verified px-2 py-0.5 text-[10px] font-bold">96% HIT RATE</span>
              </div>
              <p className="text-2xl font-extrabold text-verified">PostgreSQL / Redis</p>
              <p className="text-xs text-muted-foreground">PFMS, e-Procurement, and Bhuvan Government Datasets</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Platform Audit Logs */}
      {activeTab === "logs" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-border bg-card/80 p-5 font-mono text-xs space-y-3 backdrop-blur">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-bold text-foreground flex items-center gap-2">
                <FileCode className="size-4 text-primary" /> Live Cryptographic Audit Stream
              </span>
              <span className="text-verified text-[11px]">TLS v1.3 • Signed SHA-256</span>
            </div>

            {[
              { time: "14:28:12 IST", user: "Dr. Rajesh Kumar (super_admin)", event: "USER_ROLE_UPDATED", target: "pwd.hyderabad@gov.in", ip: "10.4.12.98", status: "SUCCESS" },
              { time: "14:26:45 IST", user: "Suresh Mehta (vendor)", event: "DOCUMENT_UPLOAD_GEO", target: "INV-9042-ORR-PHASE2.pdf", ip: "182.72.10.4", status: "VERIFIED" },
              { time: "14:22:10 IST", user: "Ananya Sharma (auditor)", event: "FRAUD_ALERT_FLAGGED", target: "ALERT-904 (Duplicate Invoice)", ip: "10.8.44.12", status: "FLAGGED" },
              { time: "14:18:02 IST", user: "Er. Vikram Reddy (government)", event: "MILESTONE_APPROVED", target: "Godavari Pipeline M3", ip: "10.2.99.41", status: "APPROVED" },
              { time: "14:05:30 IST", user: "Aarav Patel (citizen)", event: "GRIEVANCE_SUBMITTED", target: "GRV-9428 (Road Pothole)", ip: "49.207.12.88", status: "RECORDED" },
            ].map((log, idx) => (
              <div key={idx} className="flex flex-wrap items-center justify-between border-b border-border/40 pb-2 text-[11px] text-muted-foreground">
                <span className="text-primary">{log.time}</span>
                <span className="font-semibold text-foreground">{log.user}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-foreground">{log.event}</span>
                <span>{log.target}</span>
                <span className="text-verified">{log.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Dialog: Create Platform User */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-display text-lg font-bold text-foreground">Create Government System Account</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Gupta"
                  className="mt-1 w-full rounded-xl border border-border bg-background/50 p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. ramesh.gupta@gov.in"
                  className="mt-1 w-full rounded-xl border border-border bg-background/50 p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-muted-foreground">Assign Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none"
                  >
                    <option value="super_admin">Super Administrator</option>
                    <option value="government">Government Officer</option>
                    <option value="vendor">Vendor / Contractor</option>
                    <option value="auditor">Auditor</option>
                    <option value="citizen">Citizen</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground">Department / Org</label>
                  <input
                    type="text"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background/50 p-2.5 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-border px-4 py-2.5 font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
