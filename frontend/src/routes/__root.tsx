import { createRootRoute, Outlet } from "@tanstack/react-router"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <TooltipProvider delayDuration={200}>
      <Outlet />
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  )
}
