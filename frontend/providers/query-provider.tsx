"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

/**
 * One QueryClient per browser session (created in useState so it survives
 * re-renders but not page reloads). Sane defaults for a read-mostly,
 * publicly-cached transparency dashboard: short staleness window so
 * navigating between pages doesn't always refetch, but data still feels
 * live; retries are capped so a genuinely-down backend fails fast into the
 * UI's error state instead of hanging.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
