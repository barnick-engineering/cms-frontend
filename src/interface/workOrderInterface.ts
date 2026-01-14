export interface WorkOrderItem {
  item: string
  total_order: number
  unit_price: number
}

export interface WorkOrderFormInterface {
  customer?: number
  workorder?: number
  items: WorkOrderItem[]
  date?: string
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
  total_order: number
  unit_price: number
  created?: string
  updated?: string
}

export interface WorkOrderDetailResponse {
  id: number
  no: string
  customer: {
    id: number
    name: string
    email?: string
    phone?: string
    address?: string
  }
  items: WorkOrderDetailItem[]
  amount: number
  total_paid: number
  date: string
  created: string
  status: boolean
  is_delivered: boolean
  remarks: string | null
  created_by: number
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
