import type { DateRange } from 'react-day-picker'

export type LoanForOption = 'CEO' | 'CTO' | 'CMO' | 'Barnick Pracharani'

export interface Loan {
  id: number
  created?: string
  status: boolean
  created_by: number
  loan_for: LoanForOption | string
  loan_from: string | null
  amount: number
  paid: number
  remaining: number
  remarks: string | null
}

export interface LoanSummary {
  total_loan: number
  total_paid: number
  total_remaining: number
}

export interface LoanListResponse {
  data: Loan[]
  total: number
  prev_url: string | null
  next_url: string | null
  summary?: LoanSummary
  page_size?: number
  response_code: number
  response_message: string
}

export interface LoanFormInterface {
  loan_for?: LoanForOption | string
  loan_from?: string | null
  amount?: number
  paid?: number
  remaining?: number
  remarks?: string | null
  created?: string
}

export interface LoanTableProps {
  data: Loan[]
  summary?: LoanSummary
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (index: number) => void
  onSearchChange?: (value?: string) => void
  onLoanForFilterChange?: (value?: string) => void
  onDateRangeChange?: (from?: Date, to?: Date) => void
  loanForFilter?: string
  dateRange?: DateRange
}
