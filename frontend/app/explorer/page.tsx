"use client"

import { useState } from "react"
import { Landmark, Building2, HardHat, Receipt, ArrowRight, Search, Filter, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { Kicker, StatusPill, AnimatedNumber } from "@/components/sentinel/primitives"
import { cn } from "@/lib/utils"

const FLOW = [
  { id: "treasury", label: "National Treasury", icon: Landmark, amount: "₹84,240 Cr", sub: "Sanctioned pool" },
  { id: "dept", label: "Line Departments", icon: Building2, amount: "₹61,120 Cr", sub: "14 ministries" },
  { id: "project", label: "Projects", icon: HardHat, amount: "₹48,900 Cr", sub: "1,284 active" },
  { id: "vendor", label: "Vendors & Milestones", icon: Receipt, amount: "₹42,110 Cr", sub: "Verified spend" },
]

type Txn = {
  id: string
  from: string
  to: string
  amount: string
  stage: string
  status: "verified" | "pending" | "flagged"
  time: string
}

const LEDGER: Txn[] = [
  { id: "LX-88213", from: "MoRTH", to: "Meridian Infra Ltd.", amount: "₹120 Cr", stage: "project", status: "verified", time: "Today 09:41" },
  { id: "LX-88190", from: "Jal Shakti", to: "AquaWorks Consortium", amount: "₹64 Cr", stage: "vendor", status: "verified", time: "Today 08:12" },
  { id: "LX-88155", from: "Metro Dev Authority", to: "TransUrban Alliance", amount: "₹410 Cr", stage: "project", status: "pending", time: "Yesterday 18:30" },
  { id: "LX-88101", from: "Health & FW", to: "Nirman Buildcon", amount: "₹88 Cr", stage: "vendor", status: "flagged", time: "Yesterday 14:05" },
  { id: "LX-88044", from: "MNRE", to: "Helios Power Systems", amount: "₹120 Cr", stage: "vendor", status: "verified", time: "2 days ago" },
  { id: "LX-87990", from: "Treasury", to: "Commerce Dept", amount: "₹610 Cr", stage: "dept", status: "verified", time: "2 days ago" },
  { id: "LX-87921", from: "Commerce Dept", to: "ColdLink Infra", amount: "₹208 Cr", stage: "flagged", status: "flagged", time: "3 days ago" },
  { id: "LX-87880", from: "Treasury", to: "Irrigation Directorate", amount: "₹300 Cr", stage: "dept", status: "pending", time: "3 days ago" },
]

const STATUS_ICON = { verified: CheckCircle2, pending: Clock, flagged: AlertTriangle }

export default function ExplorerPage() {
  const [active, setActive] = useState<string | null>(null)
  const [q, setQ] = useState("")

  const filtered = LEDGER.filter((t) => {
    if (active && t.stage !== active) return false
    if (q && !`${t.id} ${t.from} ${t.to}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
      <Kicker>Transparency Explorer</Kicker>
      <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-balance">Follow the money</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Trace every sanctioned rupee across the chain — from the national treasury to the milestone it paid for.
        Select a stage to filter the live ledger below.
      </p>

      {/* Flow diagram */}
      <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-card p-6">
        <div className="flex min-w-[720px] items-stretch gap-2">
          {FLOW.map((node, i) => {
            const isActive = active === node.id
            return (
              <div key={node.id} className="flex flex-1 items-center gap-2">
                <button
                  onClick={() => setActive(isActive ? null : node.id)}
                  className={cn(
                    "group flex-1 rounded-2xl border p-5 text-left transition-all",
                    isActive
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-border bg-background/50 hover:border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-11 place-items-center rounded-xl transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
                    )}
                  >
                    <node.icon className="size-5" />
                  </span>
                  <div className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">{node.sub}</div>
                  <div className="mt-1 font-display font-bold leading-tight">{node.label}</div>
                  <div className="mt-2 font-display text-lg font-bold text-primary">{node.amount}</div>
                </button>
                {i < FLOW.length - 1 && (
                  <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span>Leakage prevented this year:</span>
          <span className="font-display text-base font-bold text-verified">
            ₹<AnimatedNumber value={3172} suffix=" Cr" />
          </span>
          <span className="hidden sm:inline">·</span>
          <span>Retention at each stage reflects verified onward disbursement.</span>
        </div>
      </div>

      {/* Ledger */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ledger by ID, payer or payee…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Stage:</span>
          <span className="font-semibold">{active ? FLOW.find((f) => f.id === active)?.label ?? "Flagged" : "All"}</span>
          {active && (
            <button onClick={() => setActive(null)} className="ml-1 text-xs text-primary hover:underline">
              clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-[1fr_1.4fr_1fr_auto] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
          <span>Transaction</span>
          <span>Flow</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No transactions match this view.</div>
        ) : (
          <ul>
            {filtered.map((t, i) => {
              const Icon = STATUS_ICON[t.status]
              return (
                <li
                  key={t.id}
                  className="animate-rise grid grid-cols-2 items-center gap-4 border-b border-border px-5 py-4 last:border-0 transition-colors hover:bg-muted/30 sm:grid-cols-[1fr_1.4fr_1fr_auto]"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div>
                    <div className="font-mono text-sm font-medium">{t.id}</div>
                    <div className="text-xs text-muted-foreground">{t.time}</div>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-sm sm:col-span-1">
                    <span className="font-medium">{t.from}</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                    <span className="font-medium">{t.to}</span>
                  </div>
                  <div className="font-display font-bold">{t.amount}</div>
                  <div>
                    <StatusPill status={t.status} dot={false}>
                      <Icon className="size-3" />
                      {t.status === "verified" ? "Verified" : t.status === "pending" ? "In review" : "Flagged"}
                    </StatusPill>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
