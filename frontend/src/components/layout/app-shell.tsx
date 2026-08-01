import { useState, type ReactNode } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { AiAssistant } from "@/components/layout/ai-assistant"
import { CommandPalette } from "@/components/layout/command-palette"

export function AppShell({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false)

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onOpenPalette={() => setPaletteOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <AiAssistant />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  )
}
