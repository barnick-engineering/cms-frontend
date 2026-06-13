import type { CustomerWorkOrderReportRow } from '@/interface/reportV1Interface'

export function sortCustomersByAmount(
  rows: CustomerWorkOrderReportRow[],
  direction: 'desc' | 'asc' = 'desc'
) {
  return [...rows].sort((a, b) =>
    direction === 'desc'
      ? b.total_amount - a.total_amount
      : a.total_amount - b.total_amount
  )
}

export function sortCustomersByPending(
  rows: CustomerWorkOrderReportRow[],
  direction: 'desc' | 'asc' = 'desc'
) {
  return [...rows].sort((a, b) =>
    direction === 'desc' ? b.pending - a.pending : a.pending - b.pending
  )
}
