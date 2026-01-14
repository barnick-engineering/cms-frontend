// Expense item from API
export interface Expense {
  id: number
  workorder: string
  client: string | null
  cost_paid_by: string
  no: string
  purpose: string
  details: string
  amount: number
  bill_disbursed_date: string | null
  remarks: string | null
  expense_date: string
  work_order: number
  customer: number | null
  paid_by: number
}

// Expense list response
export interface ExpenseListResponse {
  data: Expense[]
  total: number
  prev_url: string | null
  next_url: string | null
  page: number
  response_code: number
  response_message: string
}

// Expense form interface (for create)
export interface ExpenseFormInterface {
  work_order: string
  purpose: string
  customer?: string
  details?: string
  amount?: number
  expense_date?: string
  remarks?: string | null
}

// Table props
export interface ExpenseTableProps {
  data: Expense[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (index: number) => void
  onSearchChange?: (value?: string) => void
}
