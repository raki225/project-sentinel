import { ShieldCheck } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-navy py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2 text-white/60">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-sm">Project Sentinel — Infrastructure Intelligence Platform</span>
        </div>
        <p className="text-xs text-white/30">© 2026 Department of Public Works. For authorized government use.</p>
      </div>
    </footer>
  )
}
