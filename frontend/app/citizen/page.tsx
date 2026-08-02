"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Kicker, StatusPill, AnimatedNumber } from "@/components/sentinel/primitives"
import { PROJECTS, formatCrore } from "@/lib/sentinel-data"
import { cn } from "@/lib/utils"

const NEAR = PROJECTS.slice(0, 4)

const PLAIN_STATUS: Record<string, string> = {
  verified: "On track and verified",
  pending: "Being checked",
  flagged: "Needs a closer look",
}

export default function CitizenPage() {
  const [q, setQ] = useState("")
  const [sent, setSent] = useState(false)

  const results = q
    ? PROJECTS.filter((p) => `${p.name} ${p.state} ${p.category}`.toLowerCase().includes(q.toLowerCase()))
    : NEAR

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/10 to-transparent">
        <div className="mx-auto max-w-[1400px] px-4 py-16 text-center sm:px-6 lg:py-24">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-card px-4 py-1.5 text-sm font-medium text-primary">
            <Heart className="size-4" /> Built for every citizen
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl">
            See how public money is being spent{" "}
            <span className="text-primary">near you.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground text-pretty">
            No jargon. No paperwork. Just a clear, honest view of the projects your taxes are paying for — and a way to
            speak up when something looks wrong.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
            <div className="flex flex-1 items-center gap-2 pl-3">
              <Search className="size-5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search your city, district or project…"
                className="w-full bg-transparent py-2 text-base outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              Search
            </button>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span>Popular:</span>
            {["Roads", "Water", "Schools", "Hospitals"].map((t) => (
              <button
                key={t}
                onClick={() => setQ(t)}
                className="rounded-full border border-border bg-card px-2.5 py-0.5 transition-colors hover:border-primary/40"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Citizen stats */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-6 px-4 py-10 text-center sm:px-6 lg:grid-cols-4">
          {[
            { v: 1284, s: "projects you can watch" },
            { v: 84240, s: "crore being tracked", prefix: "₹" },
            { v: 26800, s: "citizen reports filed" },
            { v: 3172, s: "issues acted on" },
          ].map((x) => (
            <div key={x.s}>
              <div className="font-display text-3xl font-bold text-primary">
                <AnimatedNumber value={x.v} prefix={x.prefix ?? ""} />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{x.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects near you */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <Kicker>{q ? "Search results" : "Projects near you"}</Kicker>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {q ? `Showing matches for “${q}”` : "Happening in your area"}
            </h2>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-border bg-card/40 py-16 text-center">
            <MapPin className="size-8 text-muted-foreground" />
            <h3 className="mt-3 font-display font-bold">Nothing found for that search</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try a broader term like your district name or a category such as “water”.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {results.map((p, i) => (
              <div
                key={p.id}
                className="animate-rise flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" /> {p.state}
                    </div>
                    <h3 className="mt-1 font-display text-lg font-bold text-balance">{p.name}</h3>
                  </div>
                  <StatusPill status={p.status === "pending" ? "pending" : p.status === "flagged" ? "flagged" : "verified"}>
                    {PLAIN_STATUS[p.status]}
                  </StatusPill>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">How far along</span>
                    <span className="font-semibold">{p.progress}% done</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Budget: </span>
                    <span className="font-display font-bold">{formatCrore(p.sanctioned)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
                      <Eye className="size-4" /> Watch
                    </button>
                    <button className="inline-flex items-center gap-1.5 transition-colors hover:text-verified">
                      <ThumbsUp className="size-4" /> 128
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Report an issue */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <Kicker>Your voice matters</Kicker>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance">
              Spot something wrong? Tell us.
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              If a road stops halfway, a building looks unfinished, or the work doesn&apos;t match what was promised —
              your report goes straight into the AI verification queue, anonymously and safely.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Reports are anonymous by default",
                "AI checks it against project evidence",
                "You get notified when action is taken",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="size-5 shrink-0 text-verified" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            {sent ? (
              <div className="grid place-items-center py-10 text-center">
                <div className="grid size-14 place-items-center rounded-full bg-verified/15 text-verified">
                  <ShieldCheck className="size-7" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">Report received</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Thank you. Sentinel is now cross-checking your report against project evidence. Reference:
                  <span className="font-mono font-medium text-foreground"> CR-90418</span>
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40"
                >
                  File another
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSent(true)
                }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MessageSquarePlus className="size-4 text-primary" /> Report an issue
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Which project?</label>
                  <input
                    required
                    placeholder="e.g. the new road near my village"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">What did you notice?</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what looks wrong in your own words…"
                    className="mt-1.5 w-full resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary/50"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <Send className="size-4" /> Submit report
                </button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="size-3 text-primary" /> Reviewed by AI within minutes
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
