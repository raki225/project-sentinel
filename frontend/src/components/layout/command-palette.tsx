import { useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  LayoutDashboard,
  UploadCloud,
  GitBranch,
  Sparkles,
  FileText,
  Settings,
  Search,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { projects } from "@/data/mock"

const PAGES = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload Evidence", icon: UploadCloud },
  { to: "/timeline", label: "Timeline", icon: GitBranch },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
]

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange: setOpen }: CommandPaletteProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, setOpen])

  const go = (to: string) => {
    setOpen(false)
    navigate({ to })
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command Palette" description="Search pages and projects">
      <CommandInput placeholder="Search pages, projects, reports..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {PAGES.map((page) => (
            <CommandItem key={page.to} onSelect={() => go(page.to)}>
              <page.icon className="h-4 w-4" />
              <span>{page.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Projects">
          {projects.slice(0, 6).map((project) => (
            <CommandItem key={project.id} onSelect={() => go(`/insights/${project.id}`)}>
              <Search className="h-4 w-4" />
              <span className="truncate">{project.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
