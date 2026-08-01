import { Link, useRouterState } from "@tanstack/react-router"
import { Bell, Moon, Search, Sun } from "lucide-react"
import { useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/common/theme-provider"
import { NotificationPanel } from "@/components/layout/notification-panel"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { alerts } from "@/data/mock"

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  upload: "Upload",
  timeline: "Timeline",
  insights: "AI Insights",
  reports: "Reports",
  settings: "Settings",
}

export function AppHeader({ onOpenPalette }: { onOpenPalette: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { theme, toggleTheme } = useTheme()
  const [notifOpen, setNotifOpen] = useState(false)
  const segments = pathname.split("/").filter(Boolean)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Sentinel</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.map((seg, idx) => {
            const isLast = idx === segments.length - 1
            const label = LABELS[seg] ?? seg
            return (
              <span key={seg} className="flex items-center gap-1.5">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={`/${seg}` as "/dashboard"}>{label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex items-center gap-2 text-muted-foreground font-normal"
          onClick={onOpenPalette}
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search Sentinel...</span>
          <kbd className="ml-4 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
            ⌘K
          </kbd>
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>

        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-[18px] w-[18px]" />
              {alerts.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-background" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <NotificationPanel />
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
