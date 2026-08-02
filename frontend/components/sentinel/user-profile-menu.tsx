"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { ROLE_CONFIGS, DEMO_ACCOUNTS } from "@/lib/auth/roles"
import type { Role } from "@/types/auth"
import {
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Building,
  Briefcase,
  Bell,
  Sun,
  Moon,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function UserProfileMenu() {
  const { user, logout, switchRoleDemo, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
      >
        <User className="size-3.5" />
        <span>Portal Login</span>
      </Link>
    )
  }

  const roleConfig = ROLE_CONFIGS[user.role]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-1.5 pr-3 text-left transition-all hover:border-primary/40 focus:outline-none"
      >
        <div className={cn("grid size-8 place-items-center rounded-lg border font-bold text-xs uppercase shadow-sm", roleConfig.bgGlowClass, roleConfig.borderClass)}>
          {user.name.slice(0, 2)}
        </div>
        <div className="hidden sm:flex flex-col leading-tight">
          <span className="font-display text-xs font-bold text-foreground line-clamp-1">{user.name}</span>
          <span className="text-[10px] font-medium text-muted-foreground">{roleConfig.badgeText}</span>
        </div>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-border bg-card p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95">
            {/* Header info */}
            <div className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 border border-primary/30 px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                  {roleConfig.badgeText}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">ID: {user.id}</span>
              </div>
              <p className="mt-2 font-display text-sm font-bold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>

              {user.department && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building className="size-3.5 shrink-0 text-primary" />
                  <span className="line-clamp-1">{user.department}</span>
                </div>
              )}
              {user.designation && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Briefcase className="size-3.5 shrink-0 text-primary" />
                  <span className="line-clamp-1">{user.designation}</span>
                </div>
              )}
            </div>

            {/* Quick Role Switcher (For Evaluation & Testing) */}
            <div className="py-3 border-b border-border">
              <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-2">
                <span className="flex items-center gap-1 text-primary">
                  <Sparkles className="size-3" /> Quick Switch Role Demo
                </span>
                <span className="text-[10px]">Instant RBAC</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {(Object.keys(ROLE_CONFIGS) as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      switchRoleDemo(r)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all text-left",
                      user.role === r
                        ? "bg-primary/15 font-bold text-primary border border-primary/30"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span>{ROLE_CONFIGS[r].badgeText}</span>
                    <span className="text-[10px] font-mono opacity-60">{ROLE_CONFIGS[r].redirectPath}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="pt-2 space-y-1">
              <button
                type="button"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  <span>Appearance Theme</span>
                </span>
                <span className="capitalize">{resolvedTheme}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-4" />
                <span>Sign Out of Portal</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
