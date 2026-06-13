const PRODUCTION_PURPOSES = new Set([
  'color print',
  'perporation',
  'press bill',
  'paper/ board',
  'plate',
  'setup',
  'spot positive',
  'mat & spott',
  'binding/ crising',
  'design charge',
  'delivery',
  'dye making',
  'sample making',
])

export type ExpensePurposeGroup = 'production' | 'overhead'

export function getExpensePurposeGroup(purpose: string): ExpensePurposeGroup {
  const key = purpose.trim().toLowerCase()
  return PRODUCTION_PURPOSES.has(key) ? 'production' : 'overhead'
}
