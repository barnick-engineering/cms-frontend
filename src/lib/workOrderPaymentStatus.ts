import type { WorkOrderPaymentStatus } from '@/interface/workOrderInterface'

export function getWorkOrderValue(amount: number, totalPaid: number): number {
  if (amount > 0) return amount
  if (totalPaid > 0) return totalPaid
  return 0
}

export function getPaymentStatus(
  amount: number,
  totalPaid: number
): WorkOrderPaymentStatus {
  const orderValue = getWorkOrderValue(amount, totalPaid)
  if (orderValue > 0 && totalPaid >= orderValue) return 'paid'
  if (totalPaid > 0 && totalPaid < orderValue) return 'partial'
  return 'pending'
}

export function getPendingAmount(amount: number, totalPaid: number): number {
  const orderValue = getWorkOrderValue(amount, totalPaid)
  return Math.max(0, orderValue - totalPaid)
}
