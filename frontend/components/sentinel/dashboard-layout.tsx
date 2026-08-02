"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardSidebar } from "./dashboard-sidebar"
import { UserProfileMenu } from "./user-profile-menu"
import { useAuth } from "@/providers/auth-provider"
import { ROLE_CONFIGS } from "@/lib/auth/roles"
import type { Role } from "@/types/auth"
import {
  Bell,
  Radio,
  ChevronRight,
  ShieldCheck,
  Building,
  Sparkles,
  Layers,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
  allowedRoles: Role[]
  title: string
  subtitle: string
}

export function DashboardLayout({ children, allowedRoles, title, subtitle }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  if (!user) {
    return <ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>
  }

  const roleConfig = ROLE_CONFIGS[user.role]

  // Role-based mock notifications
  const getNotifications = () => {
    switch (user.role) {
      case "super_admin":
        return [
          { id: 1, title: "Critical Fraud Alert", text: "Flagged invoice discrepancy in ORR Expansion Phase II", time: "5m ago", type: "alert" },
          { id: 2, title: "New Department Created", text: "Telangana Rural Water Supply Board added", time: "1h ago", type: "info" },
          { id: 3, title: "Database Sync Nominal", text: "PFMS Central Ledger sync finished (2,400 records)", time: "2h ago", type: "success" },
        ]
      case "government":
        return [
          { id: 1, title: "Pending Milestone Approval", text: "Godavari Water Pipeline Phase II submitted proof", time: "12m ago", type: "alert" },
          { id: 2, title: "Inspector Assigned", text: "Auditor Ananya Sharma assigned to Outer Ring Road", time: "2h ago", type: "info" },
        ]
      case "vendor":
        return [
          { id: 1, title: "Document Accepted by AI", text: "Geotagged site photo pass rate: 98%", time: "30m ago", type: "success" },
          { id: 2, title: "Payment Disbursed", text: "₹45.0 Cr milestone payout released to bank account", time: "4h ago", type: "success" },
        ]
      case "auditor":
        return [
          { id: 1, title: "High Anomaly Score", text: "Material Grade Discrepancy detected in Flyover project", time: "10m ago", type: "alert" },
          { id: 2, title: "Field Inspection Scheduled", text: "Site Visit scheduled for Aug 5, 2026", time: "1h ago", type: "info" },
        ]
      case "citizen":
      default:
        return [
          { id: 1, title: "Grievance Update", text: "Your complaint #GRV-9428 has been assigned to PWD Chief Engineer", time: "1h ago", type: "info" },
          { id: 2, title: "New Project Verified", text: "Hyderabad Metro Phase III reached 84% completion", time: "5h ago", type: "success" },
        ]
    }
  }

  const notifications = getNotifications()

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex min-h-screen bg-background">
        {/* Dynamic RBAC Sidebar */}
        <DashboardSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Dashboard Sub-Header Bar */}
          <header className="sticky top-16 z-20 flex h-14 items-center justify-between border-b border-border bg-card/60 px-6 backdrop-blur-xl">
            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Sentinel
              </Link>
              <ChevronRight className="size-3 text-muted-foreground/60" />
              <span className="text-foreground font-semibold">{roleConfig.shortTitle}</span>
              <ChevronRight className="size-3 text-muted-foreground/60" />
              <span className="text-primary font-semibold capitalize">
                {pathname.split("/")[1] || "Dashboard"}
              </span>
            </div>

            {/* Right Status Actions */}
            <div className="flex items-center gap-3">
              {/* Active Role Pill Badge */}
              <div className={cn(
                "hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shadow-sm",
                roleConfig.bgGlowClass,
                roleConfig.borderClass
              )}>
                <span className="size-1.5 rounded-full bg-verified animate-pulse" />
                <span className="text-foreground">{roleConfig.badgeText}</span>
              </div>

              {/* Ledger Sync Status */}
              <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1 text-[11px] text-muted-foreground">
                <Radio className="size-3 text-verified animate-pulse" />
                <span>LEDGER SYNC OK</span>
              </div>

              {/* Notification Center Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative grid size-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                >
                  <Bell className="size-4" />
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {notifications.length}
                  </span>
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-border bg-card p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between border-b border-border pb-2.5">
                        <span className="font-display text-xs font-bold text-foreground">Role Alerts & Notifications</span>
                        <span className="text-[10px] text-primary font-mono">{notifications.length} New</span>
                      </div>
                      <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n.id} className="rounded-xl border border-border bg-background/40 p-2.5 text-xs">
                            <div className="flex items-center justify-between font-semibold text-foreground">
                              <span>{n.title}</span>
                              <span className="text-[10px] text-muted-foreground">{n.time}</span>
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">{n.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Profile Dropdown */}
              <UserProfileMenu />
            </div>
          </header>

          {/* Page Banner Header */}
          <div className="border-b border-border bg-card/40 px-6 py-6 backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/30">
                    {roleConfig.badgeText}
                  </span>
                  {user.department && (
                    <span className="text-xs text-muted-foreground">• {user.department}</span>
                  )}
                </div>
                <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Main Content Body */}
          <main className="flex-1 p-6 space-y-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
