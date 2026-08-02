"use client"

import Link from "next/link"
import { ShieldAlert, LogIn, ArrowLeft } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6 grid size-20 place-items-center rounded-3xl border border-destructive/40 bg-destructive/10 shadow-2xl backdrop-blur-xl">
        <ShieldAlert className="size-10 text-destructive animate-pulse" />
      </div>
      <span className="rounded-full bg-destructive/10 border border-destructive/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive">
        401 — Authentication Required
      </span>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Session Authentication Required
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        You must be signed in with a valid Project Sentinel cryptographic token to access government oversight modules.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
        >
          <LogIn className="size-4" />
          <span>Go to Portal Login</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Overview</span>
        </Link>
      </div>
    </div>
  )
}
