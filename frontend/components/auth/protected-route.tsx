"use client"

import React, { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import type { Role, Permission } from "@/types/auth"
import { ShieldAlert, Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Role[]
  requiredPermission?: Permission
}

export function ProtectedRoute({ children, allowedRoles, requiredPermission }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasPermission, hasRole } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`)
        return
      }

      if (allowedRoles && !hasRole(allowedRoles)) {
        router.push("/forbidden")
        return
      }

      if (requiredPermission && !hasPermission(requiredPermission)) {
        router.push("/forbidden")
        return
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, requiredPermission, router, pathname, hasRole, hasPermission])

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="relative grid size-16 place-items-center rounded-2xl border border-primary/30 bg-primary/10 shadow-2xl backdrop-blur-xl">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
        <div className="text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Verifying RBAC Session Security…
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">Project Sentinel Identity & Access Management</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="mx-auto my-12 max-w-xl rounded-2xl border border-destructive/40 bg-destructive/10 p-8 text-center backdrop-blur-xl">
        <ShieldAlert className="mx-auto size-12 text-destructive" />
        <h2 className="mt-4 font-display text-2xl font-bold text-foreground">Access Restricted</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your current role does not have authorization to view this government dashboard module.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
