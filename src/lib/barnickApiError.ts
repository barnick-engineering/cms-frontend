import axios from 'axios'

/** Flatten nested serializer-style objects into readable text. */
export function flattenBarnickErrors(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map((v) => flattenBarnickErrors(v)).filter(Boolean).join(' ')
  }
  if (typeof value === 'object') {
    const parts: string[] = []
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const inner = flattenBarnickErrors(val)
      if (inner) parts.push(`${key}: ${inner}`)
    }
    return parts.join('. ')
  }
  return String(value)
}

type BarnickErrorBody = {
  response_message?: unknown
  detail?: unknown
}

/**
 * Extract a user-facing message from Barnick-style API error bodies.
 * Handles string or object `response_message`, and `detail` (DRF).
 */
export function messageFromAxiosError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) return error.message
    return 'Something went wrong.'
  }
  const data = error.response?.data as BarnickErrorBody | undefined
  if (data?.response_message != null) {
    const msg = data.response_message
    if (typeof msg === 'string' && msg.trim()) return msg
    if (typeof msg === 'object') {
      const flat = flattenBarnickErrors(msg)
      if (flat) return flat
    }
  }
  // Top-level DRF validation object (no response_message)
  const asRecord = error.response?.data as Record<string, unknown> | undefined
  if (asRecord && typeof asRecord === 'object') {
    const skip = new Set(['response_message', 'response_code', 'data'])
    const rest: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(asRecord)) {
      if (!skip.has(k)) rest[k] = v
    }
    const flatRest = flattenBarnickErrors(rest)
    if (flatRest) return flatRest
  }
  const detail = data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map(String).join(' ')
  if (error.message) return error.message
  return 'Request failed.'
}

const SKIP_FIELD_ERROR_KEYS = new Set([
  'response_code',
  'data',
  'detail',
  'response_message',
])

function recordFieldErrors(obj: Record<string, unknown>): Record<string, string[]> | null {
  const out: Record<string, string[]> = {}
  for (const [key, val] of Object.entries(obj)) {
    if (SKIP_FIELD_ERROR_KEYS.has(key)) continue
    if (Array.isArray(val)) {
      out[key] = val.map((v) => (typeof v === 'string' ? v : String(v)))
    } else if (typeof val === 'string') {
      out[key] = [val]
    }
  }
  return Object.keys(out).length ? out : null
}

/** DRF-style body where each key maps to messages (arrays or string). */
function bareDrfErrors(data: Record<string, unknown>): Record<string, string[]> | null {
  const rest: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) {
    if (SKIP_FIELD_ERROR_KEYS.has(k)) continue
    rest[k] = v
  }
  return recordFieldErrors(rest)
}

/** If `response_message` is a field-keyed object, return it for per-field mapping. */
export function fieldErrorsFromAxiosError(
  error: unknown
): Record<string, string[]> | null {
  if (!axios.isAxiosError(error)) return null
  const data = error.response?.data as BarnickErrorBody | Record<string, unknown> | undefined
  if (!data || typeof data !== 'object') return null

  const msg = (data as BarnickErrorBody).response_message
  if (msg != null && typeof msg === 'object' && !Array.isArray(msg)) {
    const fromMsg = recordFieldErrors(msg as Record<string, unknown>)
    if (fromMsg) return fromMsg
  }

  // DRF-style body without Barnick envelope: { "email": ["..."] }
  return bareDrfErrors(data as Record<string, unknown>)
}
