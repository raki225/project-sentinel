"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { Role, Permission, AuthUser, AuthState } from "@/types/auth"
import { DEMO_ACCOUNTS, ROLE_CONFIGS, getPermissionsForRole, getRedirectPathForRole } from "@/lib/auth/roles"

interface AuthContextType extends AuthState {
  login: (email: string, pass: string, targetRole?: Role) => Promise<{ success: boolean; message?: string }>
  loginWithOtp: (identity: string, otp: string, targetRole: Role) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  switchRoleDemo: (newRole: Role) => void
  hasPermission: (perm: Permission) => boolean
  hasRole: (role: Role | Role[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY_TOKEN = "sentinel_auth_token"
const STORAGE_KEY_USER = "sentinel_auth_user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    sessionExpiresAt: null,
  })

  // Load initial session on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN)
      const savedUserJson = localStorage.getItem(STORAGE_KEY_USER)

      if (savedToken && savedUserJson) {
        const savedUser: AuthUser = JSON.parse(savedUserJson)
        setState({
          user: savedUser,
          token: savedToken,
          isAuthenticated: true,
          isLoading: false,
          sessionExpiresAt: Date.now() + 8 * 60 * 60 * 1000,
        })
      } else {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          sessionExpiresAt: null,
        })
      }
    } catch {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        sessionExpiresAt: null,
      })
    }
  }, [])

  const persistAuth = (user: AuthUser, token: string) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, token)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
    document.cookie = `sentinel_role=${user.role}; path=/; max-age=28800; SameSite=Lax`
    document.cookie = `sentinel_token=${token}; path=/; max-age=28800; SameSite=Lax`

    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      sessionExpiresAt: Date.now() + 8 * 60 * 60 * 1000,
    })
  }

  const login = async (email: string, pass: string, targetRole?: Role): Promise<{ success: boolean; message?: string }> => {
    // 1. Check matching demo account
    const matchedDemo = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    )

    let userToAuthenticate: AuthUser | null = null

    if (matchedDemo) {
      userToAuthenticate = {
        id: `usr-${matchedDemo.role}-01`,
        name: matchedDemo.name,
        email: matchedDemo.email,
        role: matchedDemo.role,
        department: matchedDemo.department,
        organization: matchedDemo.organization,
        designation: matchedDemo.designation,
        permissions: getPermissionsForRole(matchedDemo.role),
        lastLoginAt: new Date().toISOString(),
      }
    } else if (targetRole) {
      // Fallback for custom logins
      const roleConfig = ROLE_CONFIGS[targetRole]
      userToAuthenticate = {
        id: `usr-${targetRole}-${Math.random().toString(36).substring(2, 7)}`,
        name: email.split("@")[0].replace(".", " ").toUpperCase(),
        email: email.trim(),
        role: targetRole,
        department: roleConfig.targetAudience.split("&")[0],
        organization: "Project Sentinel Government Node",
        designation: roleConfig.shortTitle,
        permissions: getPermissionsForRole(targetRole),
        lastLoginAt: new Date().toISOString(),
      }
    } else {
      // Default to citizen if role is unspecified
      userToAuthenticate = {
        id: `usr-citizen-${Math.random().toString(36).substring(2, 7)}`,
        name: email.split("@")[0] || "User",
        email: email.trim(),
        role: "citizen",
        department: "Public User",
        organization: "Citizen Transparency Network",
        designation: "Verified User",
        permissions: getPermissionsForRole("citizen"),
        lastLoginAt: new Date().toISOString(),
      }
    }

    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({
        id: userToAuthenticate.id,
        email: userToAuthenticate.email,
        role: userToAuthenticate.role,
        exp: Math.floor(Date.now() / 1000) + 28800,
      })
    )}.mock_signature`

    persistAuth(userToAuthenticate, mockJwt)

    const redirectPath = getRedirectPathForRole(userToAuthenticate.role)
    router.push(redirectPath)
    return { success: true }
  }

  const loginWithOtp = async (identity: string, otp: string, targetRole: Role): Promise<{ success: boolean; message?: string }> => {
    if (otp.length < 4) {
      return { success: false, message: "Invalid OTP code. Please enter a 6-digit OTP." }
    }
    const roleConfig = ROLE_CONFIGS[targetRole]
    const userToAuthenticate: AuthUser = {
      id: `usr-otp-${targetRole}-${Math.random().toString(36).substring(2, 7)}`,
      name: `Officer (${identity.slice(-4)})`,
      email: identity.includes("@") ? identity : `${identity}@gov.in`,
      role: targetRole,
      department: roleConfig.targetAudience.split("&")[0],
      organization: "OTP Verified Security Node",
      designation: `${roleConfig.shortTitle} (OTP Auth)`,
      permissions: getPermissionsForRole(targetRole),
      lastLoginAt: new Date().toISOString(),
    }

    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ id: userToAuthenticate.id, role: targetRole })
    )}.mock_otp_sig`

    persistAuth(userToAuthenticate, mockJwt)
    router.push(getRedirectPathForRole(targetRole))
    return { success: true }
  }

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_USER)
    document.cookie = "sentinel_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "sentinel_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      sessionExpiresAt: null,
    })

    router.push("/login")
  }, [router])

  const switchRoleDemo = (newRole: Role) => {
    const demoAcc = DEMO_ACCOUNTS.find((a) => a.role === newRole) || DEMO_ACCOUNTS[0]
    const newUser: AuthUser = {
      id: `usr-${newRole}-demo`,
      name: demoAcc.name,
      email: demoAcc.email,
      role: newRole,
      department: demoAcc.department,
      organization: demoAcc.organization,
      designation: demoAcc.designation,
      permissions: getPermissionsForRole(newRole),
      lastLoginAt: new Date().toISOString(),
    }
    const token = `demo_switch_token_${newRole}`
    persistAuth(newUser, token)
    router.push(getRedirectPathForRole(newRole))
  }

  const hasPermission = (perm: Permission): boolean => {
    if (!state.user) return false
    return state.user.permissions.includes(perm)
  }

  const hasRole = (role: Role | Role[]): boolean => {
    if (!state.user) return false
    if (Array.isArray(role)) {
      return role.includes(state.user.role)
    }
    return state.user.role === role
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithOtp,
        logout,
        switchRoleDemo,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
