import { Link } from "@tanstack/react-router"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

const LINKS = [
  { href: "#features", label: "Platform" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#trust", label: "Trust & Security" },
]

export function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-navy/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">Project Sentinel</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-white/60 transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-white/70 hover:bg-white/5 hover:text-white">
            <Link to="/dashboard">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/dashboard">Request Access</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
