/** Display value for controlled number inputs — empty when unset. */
export function formatNumberInputValue(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined || value === '') return ''
  return String(value)
}

/** Parse user input; empty field stays undefined (not 0). */
export function parseNumberInput(raw: string): number | undefined {
  const trimmed = raw.trim()
  if (trimmed === '') return undefined
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : undefined
}

/** Coerce stored form/calculation values to a number for math. */
export function coerceNumber(value: unknown, fallback = 0): number {
  if (value === '' || value === undefined || value === null) return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}
