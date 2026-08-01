import { Link, useRouterState } from "@tanstack/react-router"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  UploadCloud,
  GitBranch,
  Sparkles,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload", icon: UploadCloud },
  { to: "/timeline", label: "Timeline", icon: GitBranch },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/reports", label: "Reports", icon: FileText },
]

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative hidden md:flex h-svh flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shrink-0"
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border/80">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <ShieldCheck className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">Project Sentinel</p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">Infrastructure Intelligence</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.to)
          const link = (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          }
          return link
        })}
      </nav>

      <div className="border-t border-sidebar-border/80 p-3 space-y-1">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-sidebar-accent text-white"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white",
          )}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>

        <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2 mt-2", !collapsed && "bg-sidebar-accent/40")}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-accent/20 text-accent text-xs">GO</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">Gov. Officer</p>
              <p className="truncate text-[11px] text-sidebar-foreground/50">District Administration</p>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-[68px] flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/70 hover:text-white"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
      </button>
    </motion.aside>
  )
}
