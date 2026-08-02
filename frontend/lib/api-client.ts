import type { ZodType } from "zod"
import type { ApiErrorKind, ApiResult } from "@/types/api"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"

const DEFAULT_TIMEOUT_MS = 15_000

function isOffline(): boolean {
  return typeof navigator !== "undefined" && "onLine" in navigator && !navigator.onLine
}

function errorKindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized"
  if (status === 403) return "forbidden"
  if (status === 404) return "not_found"
  if (status >= 500) return "server"
  return "unknown"
}

function extractMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
    return body.message
  }
  return fallback
}

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number
}

/**
 * The single fetch entry point every domain SDK module (`lib/api/*Api.ts`) is
 * built on. Never throws — every failure mode (offline, network, timeout,
 * 401/403/404/5xx, malformed JSON, or a response that fails its Zod schema)
 * resolves to a typed `ApiResult` the caller can render a specific,
 * contextual message for instead of a generic "Failed".
 */
export async function apiRequest<T>(
  path: string,
  schema: ZodType<T>,
  options: ApiRequestOptions = {}
): Promise<ApiResult<T>> {
  if (isOffline()) {
    return { ok: false, error: { kind: "offline", message: "You appear to be offline." } }
  }

  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...init } = options
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  // FormData bodies (file uploads) must NOT get an explicit Content-Type —
  // the browser sets multipart/form-data with the correct boundary itself
  // only when the header is left unset.
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: isFormData ? init.headers : { "Content-Type": "application/json", ...init.headers },
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, error: { kind: "timeout", message: "The request took too long to respond." } }
    }
    return { ok: false, error: { kind: "network", message: "Could not reach the Sentinel API." } }
  } finally {
    clearTimeout(timeout)
  }

  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    // No/invalid JSON body — status-based handling below still applies.
  }

  if (!res.ok) {
    return {
      ok: false,
      error: {
        kind: errorKindFromStatus(res.status),
        message: extractMessage(body, `Request failed with status ${res.status}`),
        status: res.status,
      },
    }
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return {
      ok: false,
      error: { kind: "invalid_response", message: "The server returned an unexpected response shape." },
    }
  }

  return { ok: true, data: parsed.data }
}

/** Maps an ApiErrorInfo.kind to the short, user-facing copy the UI should show. */
export function describeApiError(kind: ApiErrorKind): string {
  switch (kind) {
    case "offline":
      return "You're offline. Reconnect and try again."
    case "timeout":
      return "The request timed out. The server may be slow to respond."
    case "network":
      return "Could not reach the Sentinel API. Is the backend running?"
    case "unauthorized":
      return "You need to sign in to view this."
    case "forbidden":
      return "You don't have permission to view this."
    case "not_found":
      return "That resource could not be found."
    case "server":
      return "The server ran into a problem. Please try again shortly."
    case "invalid_response":
      return "The server returned data in an unexpected shape."
    case "unknown":
    default:
      return "Something went wrong."
  }
}
