/** Every request-mapping error kind the UI needs to render a distinct, contextual message for. */
export type ApiErrorKind =
  | "network"
  | "timeout"
  | "offline"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "server"
  | "invalid_response"
  | "unknown"

export interface ApiErrorInfo {
  kind: ApiErrorKind
  message: string
  status?: number
}

/** Every API call resolves to this — never throws, never lets a page trust unvalidated data. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiErrorInfo }
