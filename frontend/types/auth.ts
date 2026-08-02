export type Role = "super_admin" | "government" | "vendor" | "auditor" | "citizen"

export type Permission =
  // Super Admin
  | "manage_users"
  | "create_departments"
  | "create_organizations"
  | "create_vendors"
  | "create_auditors"
  | "assign_roles"
  | "manage_states"
  | "manage_districts"
  | "manage_projects"
  | "monitor_every_project"
  | "view_ai_analytics"
  | "view_fraud_alerts"
  | "system_configuration"
  | "api_configuration"
  | "audit_logs"
  | "activity_logs"
  | "database_monitoring"
  | "ai_model_monitoring"
  | "data_sync_monitoring"
  | "gov_datasets"
  | "platform_settings"
  // Government Officer
  | "view_dept_projects"
  | "upload_dept_documents"
  | "review_ai_analysis"
  | "approve_reports"
  | "monitor_dept_timelines"
  | "assign_inspections"
  | "generate_dept_reports"
  | "view_district_analytics"
  | "department_risk_dashboard"
  // Vendor
  | "view_assigned_projects"
  | "upload_progress_reports"
  | "upload_invoices"
  | "upload_site_images"
  | "upload_drone_footage"
  | "upload_completion_certs"
  | "track_ai_verification"
  | "respond_ai_findings"
  | "view_vendor_project_status"
  | "view_vendor_payments"
  | "view_vendor_milestones"
  // Auditor
  | "review_auditor_findings"
  | "compare_documents"
  | "verify_fraud_alerts"
  | "schedule_inspections"
  | "upload_inspection_reports"
  | "upload_field_photos"
  | "compare_previous_inspections"
  | "generate_audit_reports"
  // Citizen
  | "search_public_projects"
  | "view_public_projects"
  | "view_project_progress"
  | "view_project_location"
  | "view_completion_percentage"
  | "view_ai_transparency_score"
  | "submit_complaints"
  | "upload_complaint_photos"
  | "track_complaint"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  department?: string
  organization?: string
  designation?: string
  phone?: string
  avatarUrl?: string
  permissions: Permission[]
  lastLoginAt?: string
}

export interface RoleConfig {
  id: Role
  name: string
  shortTitle: string
  badgeText: string
  redirectPath: string
  accentColor: string
  themeClass: string
  borderClass: string
  bgGlowClass: string
  iconName: string
  description: string
  targetAudience: string
  permissionsSummary: string[]
  dashboardTitle: string
  dashboardSubtitle: string
}

export interface DemoAccount {
  role: Role
  email: string
  password: string
  name: string
  department: string
  organization: string
  designation: string
  badgeText: string
  avatarUrl?: string
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionExpiresAt: number | null
}
