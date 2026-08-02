import Link from "next/link"
import { ShieldCheck } from "lucide-react"

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Overview", href: "/" },
      { label: "Government Projects", href: "/projects" },
      { label: "Project Workspace", href: "/workspace" },
      { label: "AI Verification", href: "/verification" },
    ],
  },
  {
    title: "Transparency",
    links: [
      { label: "Fund Explorer", href: "/explorer" },
      { label: "Citizen View", href: "/citizen" },
      { label: "Reports", href: "/reports" },
      { label: "About Sentinel", href: "/about" },
    ],
  },
  {
    title: "Governance",
    links: [
      { label: "Audit Standards", href: "/about" },
      { label: "Data Charter", href: "/about" },
      { label: "Accessibility", href: "/about" },
      { label: "Contact", href: "/about" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="size-5" />
              </span>
              <span className="font-display text-sm font-bold">Project Sentinel</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Ensuring every sanctioned public rupee is spent only on its intended government infrastructure project.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-foreground/80 transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>Project Sentinel is a demonstration transparency platform. Data shown is illustrative.</p>
          <p>Built for public accountability · {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  )
}
