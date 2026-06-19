import type { WorkOrderPaymentStatus } from '@/interface/workOrderInterface'

export function getWorkOrderValue(amount: number, totalPaid: number): number {
  if (amount > 0) return amount
  if (totalPaid > 0) return totalPaid
  return 0
}

export function getPaymentStatus(
  amount: number,
  totalPaid: number,
  isPaid = false
): WorkOrderPaymentStatus {
  const orderValue = getWorkOrderValue(amount, totalPaid)
  if (isPaid || (orderValue > 0 && totalPaid >= orderValue)) return 'paid'
  if (totalPaid > 0 && totalPaid < orderValue) return 'partial'
  return 'pending'
}

export function getPendingAmount(
  amount: number,
  totalPaid: number,
  isPaid = false
): number {
  if (isPaid) return 0
  const orderValue = getWorkOrderValue(amount, totalPaid)
  return Math.max(0, orderValue - totalPaid)
}

export function getWaivedAmount(
  amount: number,
  totalPaid: number,
  isPaid = false
): number {
  if (!isPaid) return 0
  const orderValue = getWorkOrderValue(amount, totalPaid)
  return Math.max(0, orderValue - totalPaid)
}
