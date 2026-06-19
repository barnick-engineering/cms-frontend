import { subDays } from 'date-fns'
import { formatDateToString, getTodayDateString } from '@/lib/loanDateUtils'
import type { WorkOrderDetailData } from '@/interface/workOrderInterface'

export type BillingDocumentType = 'invoice' | 'quotation' | 'delivery_challan'
export type BillingDocumentStatus = 'draft' | 'finalized'

export interface BillingLineItem {
  id?: number
  position?: number
  product: string
  description: string
  quantity: number
  rate: number
  amount?: number
}

export interface BillingDocument {
  id: number
  document_type: BillingDocumentType
  document_status: BillingDocumentStatus
  document_number: string
  recipient: string
  subject: string
  address: string
  phone: string
  document_date: string | null
  customer_id: number | null
  customer: string | null
  work_order_id: number | null
  work_order_no: string | null
  delivery_cost: number
  discount: number
  advance_payment: number
  subtotal: number
  total: number
  show_totals: boolean
  terms: string | null
  balance_due: number
  line_items: BillingLineItem[]
  created?: string
  created_by?: number
}

export interface BillingDocumentFormPayload {
  document_type: BillingDocumentType
  document_status?: BillingDocumentStatus
  document_number?: string
  recipient?: string
  subject?: string
  address?: string
  phone?: string
  document_date?: string | null
  customer_id?: number | null
  work_order_id?: number | null
  delivery_cost?: number
  discount?: number
  advance_payment?: number
  show_totals?: boolean
  terms?: string | null
  line_items?: BillingLineItem[]
}

export interface BillingDocumentListParams {
  document_type?: BillingDocumentType
  status?: BillingDocumentStatus
  customer_id?: string | number
  work_order_id?: string | number
  search?: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface BillingDocumentListResponse {
  data: BillingDocument[]
  total: number
  prev_url: string | null
  next_url: string | null
  page: number
  response_message: string
  response_code: number
  summary?: BillingDocumentListSummary
}

export interface BillingDocumentListSummary {
  total_documents: number
  invoice_count: number
  quotation_count: number
  delivery_challan_count: number
}

export interface BillingDocumentEnvelope {
  data: BillingDocument
  response_message: string
  response_code: number
}

export interface BillingPrefillPayload {
  document_type: BillingDocumentType
  customer_id?: number | null
  work_order_id?: number | null
}

export const BILLING_DOCUMENT_TYPE_LABELS: Record<BillingDocumentType, string> = {
  invoice: 'Invoice',
  quotation: 'Quotation',
  delivery_challan: 'Delivery Challan',
}

/** Unique non-empty product names from line items, in first-seen order. */
export function uniqueProductNames(lineItems: BillingLineItem[]): string[] {
  const seen = new Set<string>()
  const names: string[] = []
  for (const item of lineItems) {
    const name = (item.product ?? '').trim()
    if (!name || seen.has(name)) continue
    seen.add(name)
    names.push(name)
  }
  return names
}

/** e.g. "item1, item2 & item3" */
export function formatProductNameList(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} & ${names[1]}`
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

/** Use explicit subject, or build e.g. "Quotation for item1, item2 & item3". */
export function resolveBillingDocumentSubject(
  documentType: BillingDocumentType,
  lineItems: BillingLineItem[],
  existingSubject?: string | null
): string | null {
  const explicit = (existingSubject ?? '').trim()
  if (explicit) return explicit

  const names = uniqueProductNames(lineItems)
  if (names.length === 0) return null

  const label = BILLING_DOCUMENT_TYPE_LABELS[documentType]
  return `${label} for ${formatProductNameList(names)}`
}

export const DEFAULT_QUOTATION_TERMS =
  'A 50% advance payment is required. Remaining 50% due upon completion within 15 days of delivery.\n' +
  'Valid for 15 days from issue date unless specified (*depends on raw materials price).\n' +
  'Delivery dates agreed upon at order confirmation.'

export function emptyBillingLineItem(): BillingLineItem {
  return {
    product: '',
    description: 'As per Sample',
    quantity: 0,
    rate: 0,
  }
}

export function emptyBillingDocument(
  documentType: BillingDocumentType = 'invoice'
): BillingDocumentFormPayload {
  return {
    document_type: documentType,
    document_status: 'draft',
    document_number: '',
    recipient: '',
    subject: '',
    address: '',
    phone: '',
    document_date: getTodayDateString(),
    customer_id: null,
    work_order_id: null,
    delivery_cost: 0,
    discount: 0,
    advance_payment: 0,
    show_totals: true,
    terms: documentType === 'quotation' ? DEFAULT_QUOTATION_TERMS : null,
    line_items: [emptyBillingLineItem()],
  }
}

export function computeBillingTotals(
  lineItems: BillingLineItem[],
  deliveryCost = 0,
  discount = 0
) {
  const items = lineItems.map((item) => {
    const quantity = Number(item.quantity) || 0
    const rate = Number(item.rate) || 0
    return { ...item, amount: quantity * rate }
  })
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
  const total = subtotal + (Number(deliveryCost) || 0) - (Number(discount) || 0)
  return { items, subtotal, total }
}

export function getDefaultBillingListFilters(): BillingDocumentListParams {
  const end = new Date()
  const start = subDays(end, 30)
  return {
    limit: 20,
    offset: 0,
    start_date: formatDateToString(start),
    end_date: formatDateToString(end),
  }
}

export function billingDocumentToFormPayload(
  doc: BillingDocument
): BillingDocumentFormPayload {
  return {
    document_type: doc.document_type,
    document_status: doc.document_status,
    document_number: doc.document_number,
    recipient: doc.recipient,
    subject: doc.subject,
    address: doc.address,
    phone: doc.phone,
    document_date: doc.document_date,
    customer_id: doc.customer_id,
    work_order_id: doc.work_order_id,
    delivery_cost: doc.delivery_cost,
    discount: doc.discount,
    advance_payment: doc.advance_payment,
    show_totals: doc.show_totals,
    terms: doc.terms,
    line_items: doc.line_items.map(({ product, description, quantity, rate }) => ({
      product,
      description,
      quantity: Number(quantity),
      rate: Number(rate),
    })),
  }
}

/** Map a work order to a printable billing document payload. */
export function workOrderToBillingPayload(
  workOrder: WorkOrderDetailData,
  documentType: Extract<BillingDocumentType, 'invoice' | 'delivery_challan'>
): BillingDocumentFormPayload {
  const dateStr = workOrder.date?.split('T')[0] ?? getTodayDateString()

  return {
    document_type: documentType,
    document_status: 'finalized',
    document_number: workOrder.no,
    recipient: workOrder.customer?.name ?? '',
    subject: workOrder.remarks ?? '',
    address: workOrder.customer?.address ?? '',
    phone: workOrder.customer?.phone ?? '',
    document_date: dateStr,
    customer_id: workOrder.customer?.id ?? null,
    work_order_id: workOrder.id,
    delivery_cost: Number(workOrder.delivery_charge) || 0,
    discount: 0,
    advance_payment: documentType === 'invoice' ? Number(workOrder.total_paid) || 0 : 0,
    show_totals: documentType === 'invoice',
    terms: null,
    line_items: (workOrder.items ?? []).map((item) => ({
      product: item.item,
      description: item.details ?? 'As per Sample',
      quantity: Number(item.total_order) || 0,
      rate: documentType === 'invoice' ? Number(item.unit_price) || 0 : 0,
    })),
  }
}
