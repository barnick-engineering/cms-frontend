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
  if (isPaid) return 'paid'
  const orderValue = getWorkOrderValue(amount, totalPaid)
  if (orderValue > 0 && totalPaid >= orderValue) return 'paid'
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

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  bank: 'Bank',
  bkash: 'Bkash',
}

export const DEFAULT_BKASH_NUMBER = '01671737258'
