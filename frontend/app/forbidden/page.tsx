"use client"

import Link from "next/link"
import { ShieldBan, ArrowLeft, RefreshCw } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { getRedirectPathForRole } from "@/lib/auth/roles"

export default function ForbiddenPage() {
  const { user, switchRoleDemo } = useAuth()
  const homePath = user ? getRedirectPathForRole(user.role) : "/login"

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6 grid size-20 place-items-center rounded-3xl border border-amber-500/40 bg-amber-500/10 shadow-2xl backdrop-blur-xl">
        <ShieldBan className="size-10 text-amber-500" />
      </div>
      <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-500">
        403 — Forbidden Access
      </span>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Role Authorization Conflict
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        Your logged in role <strong className="text-foreground uppercase">({user?.role || "guest"})</strong> does not have permission to access this government dashboard route.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href={homePath}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
        >
          <ArrowLeft className="size-4" />
          <span>Return to My Authorized Dashboard</span>
        </Link>
        <button
          type="button"
          onClick={() => switchRoleDemo("super_admin")}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
        >
          <RefreshCw className="size-4 text-amber-500" />
          <span>Switch to Super Admin (Demo)</span>
        </button>
      </div>
    </div>
  )
}
