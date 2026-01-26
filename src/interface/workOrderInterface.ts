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

export interface WorkOrder {
  id: number
  customer: string // Customer name
  total_items: number
  created: string
  status: boolean
  no: string
  is_delivered: boolean
  amount: number
  total_paid: number
  total_expense?: number
  delivery_charge?: number
  remarks: string | null
  date: string
  created_by: number
}

export interface WorkOrderListResponse {
  data: WorkOrder[]
  total: number
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
  amount: number
  total_paid: number
  delivery_charge?: number
  date: string
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
  total_paid: number
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
  onSearchChange?: (searchBy?: string) => void
  rowSelection?: Record<string, boolean>
}

export type WorkOrderListInterface = WorkOrder
