"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { ROLE_CONFIGS } from "@/lib/auth/roles"
import type { Role } from "@/types/auth"
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  ScanSearch,
  ShieldAlert,
  FileText,
  Clock,
  Landmark,
  Radio,
  Sliders,
  Database,
  FileSpreadsheet,
  Layers,
  MapPin,
  HelpCircle,
  FileCheck,
  AlertTriangle,
  UploadCloud,
  CreditCard,
  CalendarDays,
  FileCode,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { BrandMark } from "./brand-mark"
import { cn } from "@/lib/utils"

interface MenuItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  if (!user) return null

  const roleConfig = ROLE_CONFIGS[user.role]

  // Filter menu options per role
  const getMenuItems = (): MenuItem[] => {
    switch (user.role) {
      case "super_admin":
        return [
          { title: "National Command", href: "/admin", icon: LayoutDashboard },
          { title: "User & Role Access", href: "/admin?tab=users", icon: Users, badge: "RBAC" },
          { title: "Department Setup", href: "/admin?tab=departments", icon: Landmark },
          { title: "AI Model Oversight", href: "/admin?tab=ai", icon: Sparkles, badge: "99.8%" },
          { title: "Database & Sync", href: "/admin?tab=database", icon: Database },
          { title: "Audit & System Logs", href: "/admin?tab=logs", icon: FileCode },
          { title: "Public Explorer", href: "/explorer", icon: FolderKanban },
        ]

      case "government":
        return [
          { title: "Department KPIs", href: "/government", icon: LayoutDashboard },
          { title: "Project Health & Specs", href: "/government?tab=projects", icon: Building2 },
          { title: "AI Approvals Queue", href: "/government?tab=approvals", icon: ScanSearch, badge: "5 Pending" },
          { title: "District Risk Map", href: "/government?tab=map", icon: MapPin },
          { title: "Inspection Dispatch", href: "/government?tab=inspections", icon: Users },
          { title: "Department Reports", href: "/reports", icon: FileText },
        ]

      case "vendor":
        return [
          { title: "Contracts Overview", href: "/vendor", icon: LayoutDashboard },
          { title: "Assigned Milestones", href: "/vendor?tab=milestones", icon: FolderKanban },
          { title: "Evidence Upload Center", href: "/vendor?tab=upload", icon: UploadCloud, badge: "Upload" },
          { title: "AI Verification Results", href: "/vendor?tab=ai-results", icon: ScanSearch },
          { title: "Disbursement & Invoices", href: "/vendor?tab=payments", icon: CreditCard },
          { title: "Public Projects", href: "/projects", icon: Building2 },
        ]

      case "auditor":
        return [
          { title: "Audit Operations", href: "/auditor", icon: LayoutDashboard },
          { title: "Fraud Alerts Queue", href: "/auditor?tab=alerts", icon: ShieldAlert, badge: "6 Critical" },
          { title: "Evidence Comparator", href: "/auditor?tab=evidence", icon: ScanSearch },
          { title: "Inspection Calendar", href: "/auditor?tab=calendar", icon: CalendarDays },
          { title: "Audit Studio", href: "/reports", icon: FileText },
        ]

      case "citizen":
      default:
        return [
          { title: "Transparency Portal", href: "/citizen", icon: LayoutDashboard },
          { title: "Public Infrastructure Map", href: "/citizen?tab=map", icon: MapPin },
          { title: "Submit Public Issue", href: "/citizen?tab=complain", icon: AlertTriangle, badge: "Grievance" },
          { title: "Grievance Tracker", href: "/citizen?tab=track", icon: Clock },
          { title: "AI Score Standard", href: "/about", icon: HelpCircle },
        ]
    }
  }

  const items = getMenuItems()

  return (
    <aside
      className={cn(
        "sticky top-16 z-30 flex h-[calc(100vh-4rem)] flex-col border-r border-border bg-card/50 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Role Badge Banner Header */}
      <div className="border-b border-border p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className={cn("grid size-9 shrink-0 place-items-center rounded-xl border shadow-sm", roleConfig.bgGlowClass, roleConfig.borderClass)}>
            <BrandMark className="size-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-xs font-bold text-foreground">{roleConfig.shortTitle}</span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{user.role}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href || (item.href.includes("?") && pathname + window.location.search === item.href)
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className={cn("size-4 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span>{item.title}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                        active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card p-2 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  )
}
