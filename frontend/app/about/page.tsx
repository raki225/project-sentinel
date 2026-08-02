"use client"

import Link from "next/link"
import {
  ShieldCheck,
  Eye,
  ScanSearch,
  FileCheck2,
  Lock,
  Users,
  ArrowRight,
  Landmark,
  Fingerprint,
  GitBranch,
  Sparkles,
} from "lucide-react"
import { Reveal, Kicker, AnimatedNumber } from "@/components/sentinel/primitives"

const PILLARS = [
  {
    icon: Eye,
    title: "Radical transparency",
    body: "Every sanctioned rupee is published, traceable, and open to public inspection — from treasury to trench.",
  },
  {
    icon: ScanSearch,
    title: "AI verification",
    body: "Models cross-check invoices, satellite imagery, and field evidence to confirm work matches the spend.",
  },
  {
    icon: FileCheck2,
    title: "Evidence-backed audit",
    body: "Nothing is verified on trust alone. Each milestone carries a cryptographically anchored evidence chain.",
  },
]

const STEPS = [
  { n: "01", icon: Landmark, title: "Funds sanctioned", body: "A project budget is approved and recorded on the public ledger with its intended scope." },
  { n: "02", icon: GitBranch, title: "Disbursement traced", body: "Each release is linked to a specific milestone and contractor, never a lump sum." },
  { n: "03", icon: ScanSearch, title: "AI cross-checks", body: "Evidence is scanned against expected progress. Mismatches are flagged in real time." },
  { n: "04", icon: FileCheck2, title: "Public verification", body: "Citizens and auditors independently confirm results with signed, hash-anchored records." },
]

const PRINCIPLES = [
  { icon: Lock, title: "Tamper-evident by design", body: "Records are hash-anchored so any alteration is immediately detectable." },
  { icon: Fingerprint, title: "Attributable actions", body: "Every verification and disbursement is signed and permanently attributed." },
  { icon: Users, title: "Built for the public", body: "Plain-language views ensure any citizen can understand where money went." },
]

export default function AboutPage() {
  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <Reveal className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              Project Sentinel
            </span>
            <h1 className="mt-6 text-balance font-serif text-5xl font-semibold tracking-tight sm:text-6xl">
              Public money should leave a public trail.
            </h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              Project Sentinel is an AI-native transparency platform that ensures every sanctioned public rupee is spent
              only for its intended infrastructure. We turn opaque budgets into verifiable, evidence-backed records that
              anyone can audit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Explore the platform
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/citizen"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Citizen view
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission stats */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { label: "Rupees under watch", node: <AnimatedNumber value={14790} prefix="₹" suffix=" Cr" /> },
            { label: "Projects monitored", node: <AnimatedNumber value={1284} /> },
            { label: "Verification accuracy", node: <AnimatedNumber value={99} suffix="%" /> },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="rounded-2xl border border-border bg-card p-8 text-center">
              <div className="font-serif text-3xl font-semibold tabular-nums">{s.node}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <Reveal className="max-w-2xl">
          <Kicker>What we stand for</Kicker>
          <h2 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Three commitments behind every record.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-8">
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <p.icon className="size-6" />
                </span>
                <h3 className="mt-6 text-lg font-semibold">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Reveal className="max-w-2xl">
            <Kicker>How Sentinel works</Kicker>
            <h2 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              From sanction to verified spend.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="relative flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-muted-foreground">{s.n}</span>
                    <s.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <Reveal>
            <Kicker>Trust architecture</Kicker>
            <h2 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Government-grade integrity, verifiable by anyone.
            </h2>
            <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
              Sentinel does not ask you to trust it. It gives you the tools to check for yourself. Every claim on the
              platform is backed by a signed, tamper-evident record.
            </p>
          </Reveal>
          <div className="grid gap-4">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <p.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6">
        <Reveal className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center sm:p-16">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <ShieldCheck className="size-7" />
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Accountability shouldn&apos;t require permission.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Start tracing public infrastructure spending today — no login, no barriers, just the record.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Browse projects
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Read reports
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
