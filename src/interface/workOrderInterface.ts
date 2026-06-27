export interface WorkOrderItem {
  id?: number
  item: string
  total_order: number
  unit_price: number
}

export interface WorkOrderFormInterface {
  customer?: number
  items: WorkOrderItem[]
  date?: string
  amount?: number
  delivery_charge?: number
  total_paid?: number
  remarks?: string | null
}

export interface WorkOrderListItem {
  id: number
  order?: number
  item: string
  details?: string | null
  total_order: number | string
  unit_price: number | string
  created?: string
  status?: boolean
  created_by?: number
}

export type WorkOrderPaymentStatus = 'paid' | 'pending' | 'partial'

export interface WorkOrderListParams {
  search?: string
  limit?: number
  offset?: number
  customer_id?: string | number
  start_date?: string
  end_date?: string
  payment_status?: WorkOrderPaymentStatus
  is_delivered?: 'true' | 'false' | boolean
  work_order_no?: string
}

export interface WorkOrderListSummary {
  total_orders: number
  total_amount: number
  total_paid: number
  total_pending: number
}

export interface WorkOrder {
  id: number
  customer: string // Customer name
  customer_id?: number
  total_items: number
  created: string
  status: boolean
  no: string
  is_delivered: boolean
  is_paid?: boolean
  amount: number
  total_paid: number
  total_expense?: number
  delivery_charge?: number
  remarks: string | null
  date?: string | null
  created_by: number
  items?: WorkOrderListItem[]
}

export interface WorkOrderListResponse {
  data: WorkOrder[]
  total: number
  summary?: WorkOrderListSummary
  prev_url: string | null
  next_url: string | null
  page: number
  response_message: string
  response_code: number
}

export interface WorkOrderDetailItem {
  id: number
  item: string
  details: string | null
  total_order: number
  unit_price: number
  created?: string
  updated?: string
}

export interface WorkOrderDetailExpenseItem {
  id: number
  no: string
  amount: number
  purpose: string
  details: string | null
  paid_by: string
  expense_date: string
  bill_disbursed_date: string | null
}

export interface WorkOrderDetailExpense {
  total: number
  details: WorkOrderDetailExpenseItem[]
}

export type WorkOrderPaymentMethod = 'cash' | 'bank' | 'bkash'

export interface WorkOrderPaymentRecord {
  id: number
  amount: number
  method: WorkOrderPaymentMethod
  bkash_number: string | null
  created: string
  paid_by: string | null
}

export interface WorkOrderDetailData {
  id: number
  no: string
  customer: {
    id: number
    name: string
    phone?: string
    address?: string
    contact_person_name?: string
  }
  items: WorkOrderDetailItem[]
  total_items: number
  expense: WorkOrderDetailExpense[]
  payments?: WorkOrderPaymentRecord[]
  amount: number
  total_paid: number
  is_paid?: boolean
  delivery_charge?: number
  date?: string | null
  created: string
  status: boolean
  is_delivered: boolean
  remarks: string | null
  created_by: number
}

export interface WorkOrderDetailResponse {
  data: WorkOrderDetailData
  response_message: string
  response_code: number
}

export interface WorkOrderUpdatePayload {
  amount?: number
  total_paid?: number
  method?: WorkOrderPaymentMethod
  bkash_number?: string
  is_paid?: boolean
}

export interface WorkOrderMutateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: WorkOrder
  onSave?: (updatedData: WorkOrderFormInterface) => void
}

export interface DataTablePropsInterface {
  data: WorkOrder[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (pageIndex: number) => void
  rowSelection?: Record<string, boolean>
}

export type WorkOrderListInterface = WorkOrder
