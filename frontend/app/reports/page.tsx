"use client"

import { useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  FileText,
  Download,
  Calendar,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import { Reveal, Kicker, StatusPill, AnimatedNumber } from "@/components/sentinel/primitives"
import { PROJECTS, formatCrore } from "@/lib/sentinel-data"
import { cn } from "@/lib/utils"

const ProjectMap = dynamic(() => import("@/components/sentinel/project-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[420px] place-items-center rounded-2xl border border-border bg-card">
      <span className="text-sm text-muted-foreground">Loading map…</span>
    </div>
  ),
})

const FORMATS = ["PDF", "CSV", "JSON", "XBRL"] as const

type Report = {
  id: string
  title: string
  summary: string
  category: "Financial" | "Progress" | "Audit"
  status: "verified" | "pending" | "flagged"
  date: string
  pages: number
}

const REPORTS: Report[] = [
  {
    id: "RPT-Q2-26",
    title: "National Infrastructure Integrity Report — Q2 FY26",
    summary: "Consolidated sanctioned-vs-utilized analysis across all monitored programs with anomaly findings.",
    category: "Audit",
    status: "verified",
    date: "12 Jul 2026",
    pages: 148,
  },
  {
    id: "RPT-ROAD-11",
    title: "Roads & Highways — Fund Utilization Disclosure",
    summary: "Milestone-linked disbursement tracing for all active expressway and corridor projects.",
    category: "Financial",
    status: "verified",
    date: "28 Jun 2026",
    pages: 62,
  },
  {
    id: "RPT-HEALTH-07",
    title: "Rural Healthcare Programme — Progress Assessment",
    summary: "Field-verified construction progress against released funds, including flagged sub-centres.",
    category: "Progress",
    status: "flagged",
    date: "19 Jun 2026",
    pages: 44,
  },
  {
    id: "RPT-WATER-05",
    title: "District Water Grid — Quarterly Financials",
    summary: "Treatment network capital expenditure reconciliation with contractor invoice evidence.",
    category: "Financial",
    status: "verified",
    date: "05 Jun 2026",
    pages: 38,
  },
  {
    id: "RPT-METRO-09",
    title: "Metro Blue Line — Contractor Risk Review",
    summary: "Tunnel boring invoice review, pending verification items, and vendor concentration analysis.",
    category: "Audit",
    status: "pending",
    date: "22 May 2026",
    pages: 71,
  },
  {
    id: "RPT-ENERGY-03",
    title: "Solar Micro-Grid — Impact & Capacity Report",
    summary: "Field-verified output against sanctioned capacity with per-village electrification progress.",
    category: "Progress",
    status: "verified",
    date: "14 May 2026",
    pages: 29,
  },
]

const totalSanctioned = PROJECTS.reduce((s, p) => s + p.sanctioned, 0)
const totalUtilized = PROJECTS.reduce((s, p) => s + p.utilized, 0)
const tracedPct = Math.round((totalUtilized / PROJECTS.reduce((s, p) => s + p.released, 0)) * 100)
const flaggedCount = PROJECTS.filter((p) => p.status === "flagged").length

export default function ReportsPage() {
  const [activeFormat, setActiveFormat] = useState<(typeof FORMATS)[number]>("PDF")

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="max-w-3xl">
          <Kicker>Reports &amp; Disclosures</Kicker>
          <h1 className="mt-4 text-balance font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Every rupee, accounted for on the public record.
          </h1>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            Auto-composed, evidence-backed audit reports generated from verified project data. Download in the format
            your office, auditor, or newsroom needs.
          </p>
        </div>
      </section>

      {/* Live project locations — real data from the Sentinel backend */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <Reveal>
          <Kicker>Live from the field</Kicker>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">Analyzed project locations</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Every document run through <span className="font-medium text-foreground">POST /api/analyze</span> is
            geocoded from its extracted department and district. Pins are colored by AI-assessed risk score.
          </p>
          <div className="mt-5">
            <ProjectMap height={420} />
          </div>
        </Reveal>
      </section>

      {/* Featured report */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <Reveal className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <Sparkles className="size-4" />
              Featured &middot; Composed by Sentinel AI
            </div>
            <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight">
              National Infrastructure Integrity Report &mdash; Q2 FY26
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A consolidated view of sanctioned versus utilized funds across all monitored programs, with anomaly
              findings, contractor risk scoring, and evidence chains attached to each disbursement.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Sanctioned", node: <span>{formatCrore(totalSanctioned)}</span> },
                { label: "Funds traced", node: <AnimatedNumber value={tracedPct} suffix="%" /> },
                { label: "Anomalies", node: <AnimatedNumber value={flaggedCount} /> },
                { label: "Evidence items", node: <AnimatedNumber value={8930} /> },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-secondary/50 p-4">
                  <div className="text-lg font-semibold tabular-nums">{s.node}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg border border-border p-1">
                {FORMATS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFormat(f)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      activeFormat === f
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90">
                <Download className="size-4" />
                Download {activeFormat}
              </button>
            </div>
          </div>

          {/* Verification panel */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-8">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="size-5 text-primary" />
              Cryptographic verification
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This report is signed and hash-anchored. Anyone can independently confirm it has not been altered since
              publication.
            </p>
            <dl className="mt-6 space-y-4 text-sm">
              {[
                { k: "Document hash", v: "0x9f4a…c2e1" },
                { k: "Signed by", v: "Office of the CAG" },
                { k: "Published", v: "12 Jul 2026" },
                { k: "Anchor block", v: "#4,821,904" },
              ].map((r) => (
                <div key={r.k} className="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
                  <dt className="text-muted-foreground">{r.k}</dt>
                  <dd className="font-mono text-xs">{r.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-verified/30 bg-verified/12 px-3 py-2.5 text-sm text-verified">
              <CheckCircle2 className="size-4" />
              Integrity verified
            </div>
          </div>
        </Reveal>
      </section>

      {/* Report library */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Report library</h2>
            <p className="mt-1 text-sm text-muted-foreground">{REPORTS.length} published disclosures</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {REPORTS.map((r, i) => {
            const Icon = r.category === "Financial" ? BarChart3 : r.category === "Progress" ? TrendingUp : FileText
            return (
              <Reveal key={r.id} delay={i * 60}>
                <article className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="size-5" />
                    </span>
                    <StatusPill status={r.status} dot={false}>
                      {r.category}
                    </StatusPill>
                  </div>
                  <h3 className="mt-4 text-base font-semibold leading-snug">{r.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{r.summary}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {r.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="size-3.5" />
                      {r.pages} pp
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
                    <button className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      <Download className="size-4" />
                      Download
                    </button>
                    <Link
                      href="/workspace"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Source data
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Snapshot strip */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Reports published", node: <AnimatedNumber value={342} /> },
            { label: "Avg. compose time", node: <AnimatedNumber value={38} suffix="s" /> },
            { label: "Independent downloads", node: <AnimatedNumber value={214000} /> },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-6">
              <div className="text-2xl font-semibold tabular-nums">{s.node}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
