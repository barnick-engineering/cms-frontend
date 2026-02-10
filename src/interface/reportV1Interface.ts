// Customer Wise Work Order Report
export interface CustomerWorkOrderReportRow {
  customer_id: number
  customer_name: string
  total_amount: number
  total_paid: number
  pending: number
  order_count: number
}

export interface CustomerWorkOrderReportSummary {
  total_customers: number
  grand_total_amount: number
  grand_total_paid: number
  grand_total_pending: number
}

export interface CustomerWorkOrderReportResponse {
  data: CustomerWorkOrderReportRow[]
  total: number
  prev_url: string | null
  next_url: string | null
  page: number
  summary: CustomerWorkOrderReportSummary
}

// Balance Sheet Report
export interface BalanceSheetReportData {
  income: number
  expenses: number
  net_profit: number
  profit_margin_percent: number
}

export interface BalanceSheetReportPeriod {
  start_date: string
  end_date: string
}

export interface BalanceSheetReportResponse {
  data: BalanceSheetReportData
  period: BalanceSheetReportPeriod
}

// Work Order Details Report
export interface WorkOrderDetailsReportWorkOrder {
  id: number
  no: string
  customer: string
  customer_id: number
  amount: number
  total_paid: number
  date: string
  is_delivered: boolean
  delivery_charge: number
}

export interface WorkOrderDetailsReportItem {
  id: number
  item: string
  details: string | null
  total_order: number
  unit_price: number
}

export interface WorkOrderDetailsReportExpense {
  id: number
  no: string
  purpose: string
  amount: number
  details: string | null
  expense_date: string
  paid_by: string
}

export interface WorkOrderDetailsReportRow {
  work_order: WorkOrderDetailsReportWorkOrder
  items: WorkOrderDetailsReportItem[]
  expenses: WorkOrderDetailsReportExpense[]
  total_expense: number
  net_profit: number
}

// Expense Report (reports/expenses)
export interface ExpenseReportV1Row {
  id: number
  no: string
  purpose: string
  amount: number
  details: string
  expense_date: string
  bill_disbursed_date: string | null
  work_order: string | null
  work_order_id: number | null
  customer: string | null
  customer_id: number | null
  paid_by: string
  remarks: string | null
}

export interface ExpenseReportV1Summary {
  total_expenses: number
  count: number
}

export interface ExpenseReportV1Response {
  data: ExpenseReportV1Row[]
  total: number
  prev_url: string | null
  next_url: string | null
  page: number
  summary: ExpenseReportV1Summary
}

// Trending Report
export interface TrendingReportRow {
  period: string
  revenue: number
  expenses: number
  net_profit: number
  order_count: number
}

export interface TrendingReportSummary {
  total_revenue: number
  total_expenses: number
  total_net_profit: number
  total_orders: number
}

export interface TrendingReportResponse {
  data: TrendingReportRow[]
  summary: TrendingReportSummary
}

// Params for report APIs (optional date range, optional pagination)
export interface ReportV1Params {
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

// Paginated work order details response (backend returns data + total, no summary)
export interface WorkOrderDetailsReportPaginatedResponse {
  data: WorkOrderDetailsReportRow[]
  total: number
  prev_url: string | null
  next_url: string | null
  page: number
}
