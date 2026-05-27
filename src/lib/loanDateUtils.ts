/** Local calendar date as YYYY-MM-DD (avoids UTC drift from toISOString). */
export const getTodayDateString = (): string => formatDateToString(new Date())

export const toDateString = (value?: string | null): string | undefined => {
  if (!value) return undefined
  return value.split('T')[0]
}

export const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getLoanCreatedDate = (loan: {
  created?: string | null
}): string | undefined => loan.created?.trim() || undefined

export const formatLoanCreatedDate = (loan: { created?: string | null }): string => {
  const raw = getLoanCreatedDate(loan)
  if (!raw) return '-'
  const datePart = toDateString(raw)
  if (!datePart) return '-'
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString()
}
