"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ShieldCheck,
  ShieldAlert,
  Landmark,
  Building2,
  ScanSearch,
  Users,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Radio,
  Eye,
  EyeOff,
  Cpu,
  Globe2,
  Fingerprint,
  Phone,
  HelpCircle,
} from "lucide-react"
import { BrandMark } from "@/components/sentinel/brand-mark"
import { useAuth } from "@/providers/auth-provider"
import { DEMO_ACCOUNTS, ROLE_CONFIGS } from "@/lib/auth/roles"
import type { Role } from "@/types/auth"
import { cn } from "@/lib/utils"

function LoginContent() {
  const { login, loginWithOtp, isAuthenticated, user } = useAuth()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo")

  const [selectedRole, setSelectedRole] = useState<Role>("super_admin")
  const [authMode, setAuthMode] = useState<"password" | "otp">("password")
  
  // Form state
  const [email, setEmail] = useState("admin@sentinel.gov")
  const [password, setPassword] = useState("Admin@123")
  const [otp, setOtp] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)

  // Update credentials when role selection changes
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setErrorMessage(null)
    const demo = DEMO_ACCOUNTS.find((d) => d.role === role)
    if (demo) {
      setEmail(demo.email)
      setPassword(demo.password)
    }
  }

  const activeRoleConfig = ROLE_CONFIGS[selectedRole]

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await login(email, password, selectedRole)
      if (!res.success) {
        setErrorMessage(res.message || "Failed to authenticate. Please check your credentials.")
      }
    } catch {
      setErrorMessage("Network error occurred during login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpSent) {
      setOtpSent(true)
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await loginWithOtp(email, otp, selectedRole)
      if (!res.success) {
        setErrorMessage(res.message || "Invalid OTP code.")
      }
    } catch {
      setErrorMessage("Failed to verify OTP code.")
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case "super_admin":
        return ShieldAlert
      case "government":
        return Landmark
      case "vendor":
        return Building2
      case "auditor":
        return ScanSearch
      case "citizen":
        return Users
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* Background blueprint grid & dynamic aura */}
      <div className="absolute inset-0 grid-blueprint opacity-40 pointer-events-none" />
      <div className="pointer-events-none absolute -left-40 top-10 size-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-10 size-[500px] rounded-full bg-accent-teal/10 blur-[120px]" />

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-12 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:py-16">
        
        {/* Left Side: National Branding & System Intel */}
        <div className="flex flex-1 flex-col justify-center space-y-8 lg:pr-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 backdrop-blur-md">
            <ShieldCheck className="size-4 text-primary animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              National Infrastructure Oversight Platform
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BrandMark className="size-10" />
              <span className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                PROJECT SENTINEL
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-[1.15]">
              Enterprise Multi-Role <br />
              <span className="bg-gradient-to-r from-primary via-accent-teal to-verified bg-clip-text text-transparent">
                Identity & Access Control
              </span>
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg leading-relaxed">
              Securing every sanctioned rupee of India&apos;s infrastructure through explainable AI verification, 
              cryptographic ledger trails, and role-segregated governance.
            </p>
          </div>

          {/* System Integrity Stats */}
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monitored Projects</p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">1,284</p>
              <p className="text-[11px] font-medium text-verified flex items-center gap-1 mt-0.5">
                <span className="size-1.5 rounded-full bg-verified" /> Live Synced
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sanctioned Value</p>
              <p className="mt-1 font-display text-2xl font-bold text-primary">₹48,200 Cr</p>
              <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Verified Ledger</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Integrity Score</p>
              <p className="mt-1 font-display text-2xl font-bold text-accent-teal">99.8%</p>
              <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Zero Fraud Target</p>
            </div>
          </div>

          {/* Active Security Badges */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Enterprise Security Certifications</p>
            <div className="flex flex-wrap gap-2.5">
              {[
                { label: "GovID / MeriPehchaan SSO Ready", icon: Globe2 },
                { label: "Role-Based Access Control (RBAC)", icon: KeyRound },
                { label: "AES-256 & JWT Encrypted", icon: Lock },
                { label: "Automated Audit Trail", icon: Cpu },
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border border-border bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                  <badge.icon className="size-3.5 text-primary" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Role Selector & Login Form */}
        <div className="w-full flex-1 max-w-xl">
          <div className="relative rounded-3xl border border-border bg-card/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all">
            
            {/* Header tab line */}
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Portal Authentication</h2>
                <p className="text-xs text-muted-foreground">Select your role to access your custom dashboard</p>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMode("password")}
                  className={cn(
                    "rounded-full px-3 py-1 font-medium transition-all",
                    authMode === "password" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("otp")}
                  className={cn(
                    "rounded-full px-3 py-1 font-medium transition-all",
                    authMode === "otp" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  OTP / SMS
                </button>
              </div>
            </div>

            {/* Role Selection Tabs */}
            <div className="mb-6 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Platform Role (5 Roles Available)
              </label>
              <div className="grid grid-cols-5 gap-1.5 rounded-xl border border-border bg-muted/30 p-1.5">
                {(Object.keys(ROLE_CONFIGS) as Role[]).map((r) => {
                  const Icon = getRoleIcon(r)
                  const isSelected = selectedRole === r
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-lg p-2 text-center transition-all",
                        isSelected
                          ? "bg-card text-foreground shadow-md ring-1 ring-primary"
                          : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("size-4 mb-1", isSelected ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-[10px] font-semibold leading-none">{ROLE_CONFIGS[r].shortTitle}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Active Selected Role Card Banner */}
            <div className={cn(
              "mb-6 rounded-2xl border p-4 transition-all backdrop-blur-md bg-gradient-to-r",
              activeRoleConfig.themeClass,
              activeRoleConfig.borderClass
            )}>
              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-border bg-background/80 p-2.5 shadow-sm">
                  {React.createElement(getRoleIcon(selectedRole), { className: "size-5 text-primary" })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-foreground">
                      {activeRoleConfig.name}
                    </span>
                    <span className="rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Redirects to {activeRoleConfig.redirectPath}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{activeRoleConfig.description}</p>
                </div>
              </div>
            </div>

            {/* 1-Click Demo Quick Fill Bar */}
            <div className="mb-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3">
              <div className="flex items-center justify-between text-xs font-semibold text-primary mb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> Demo Account Credentials
                </span>
                <span className="text-[10px] text-muted-foreground">Click to auto-fill</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => {
                      handleRoleSelect(acc.role)
                      setEmail(acc.email)
                      setPassword(acc.password)
                    }}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all",
                      selectedRole === acc.role
                        ? "border-primary bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {acc.badgeText}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message Toast */}
            {errorMessage && (
              <div className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                <ShieldAlert className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            {authMode === "password" ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                    <span>Email Address / Gov User ID</span>
                    <span className="text-[11px] text-muted-foreground">Official domain preferred</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@sentinel.gov"
                      className="w-full rounded-xl border border-border bg-background/50 pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                    <span>Password</span>
                    <button
                      type="button"
                      onClick={() => alert("Demo Password: Use the pre-filled credentials for instant login.")}
                      className="text-[11px] text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border bg-background/50 pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 font-medium text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Remember session for 8 hours</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Authenticating Role & Cryptographic Token…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to {activeRoleConfig.shortTitle} Dashboard</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Mobile Number or Government Identity</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="+91 98765 43210 or official email"
                      className="w-full rounded-xl border border-border bg-background/50 pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {otpSent ? (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                      <span>Enter 6-Digit OTP Code</span>
                      <span className="text-[11px] text-verified font-medium">OTP Sent to {email}</span>
                    </label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full rounded-xl border border-border bg-background/50 pl-9 pr-4 py-2.5 text-center font-mono text-lg font-bold tracking-widest text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center">
                      For testing, enter any 6 digits (e.g. 123456)
                    </p>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Verifying OTP Security Code…</span>
                      </>
                    ) : otpSent ? (
                      <>
                        <span>Verify & Open {activeRoleConfig.shortTitle} Portal</span>
                        <CheckCircle2 className="size-4" />
                      </>
                    ) : (
                      <>
                        <span>Send Security OTP Code</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}

            {/* Footer Information */}
            <div className="mt-6 border-t border-border pt-4 text-center text-xs text-muted-foreground flex items-center justify-between">
              <span>National Informatics Centre Integration</span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Radio className="size-3 text-verified animate-pulse" /> Sentinel TLS v1.3
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[70vh] place-items-center">
          <span className="text-xs text-muted-foreground">Loading Authentication Center…</span>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
