import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type {
  CustomerWorkOrderReportRow,
  CustomerWorkOrderReportSummary,
  BalanceSheetReportResponse,
  WorkOrderDetailsReportRow,
  ExpenseReportV1Row,
  ExpenseReportV1Summary,
  TrendingReportRow,
  TrendingReportSummary,
} from '@/interface/reportV1Interface'

const REPORT_HEADER = 'Barnick Pracharani'

function headerRows(title: string, dateRange?: { from: string; to: string }) {
  return [
    [REPORT_HEADER],
    [title],
    ['Period:', dateRange ? `${dateRange.from} to ${dateRange.to}` : 'All time'],
    ['Generated:', new Date().toLocaleDateString()],
    [],
  ]
}

export function generateCustomerWorkOrdersExcel(
  data: CustomerWorkOrderReportRow[],
  summary: CustomerWorkOrderReportSummary,
  dateRange?: { from: string; to: string }
) {
  const rows = [
    ...headerRows('Customer Wise Work Order Report', dateRange),
    ['Customer', 'Total Amount', 'Total Paid', 'Pending', 'Order Count'],
    ...data.map((r) => [r.customer_name, r.total_amount, r.total_paid, r.pending, r.order_count]),
    [],
    ['Summary', ''],
    ['Total customers', summary.total_customers],
    ['Grand total amount', summary.grand_total_amount],
    ['Grand total paid', summary.grand_total_paid],
    ['Grand total pending', summary.grand_total_pending],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Customer Work Orders')
  const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
    type: 'application/octet-stream',
  })
  saveAs(blob, `Customer_Work_Orders_Report_${Date.now()}.xlsx`)
}

export function generateBalanceSheetExcel(
  payload: BalanceSheetReportResponse,
  dateRange?: { from: string; to: string }
) {
  const d = payload.data
  const period = dateRange ?? (payload.period ? { from: payload.period.start_date, to: payload.period.end_date } : undefined)
  const rows = [
    ...headerRows('Balance Sheet Report', period),
    ['Income', d.income],
    ['Expenses', d.expenses],
    ['Net profit', d.net_profit],
    ['Profit margin (%)', d.profit_margin_percent],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet')
  const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
    type: 'application/octet-stream',
  })
  saveAs(blob, `Balance_Sheet_Report_${Date.now()}.xlsx`)
}

export function generateWorkOrderDetailsExcel(
  data: WorkOrderDetailsReportRow[],
  dateRange?: { from: string; to: string }
) {
  const rows = [
    ...headerRows('Work Order Details Report', dateRange),
    ['WO No', 'Customer', 'Amount', 'Total Paid', 'Date', 'Total Expense', 'Net Profit'],
    ...data.map((r) => [
      r.work_order.no,
      r.work_order.customer,
      r.work_order.amount,
      r.work_order.total_paid,
      r.work_order.date,
      r.total_expense,
      r.net_profit,
    ]),
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Work Order Details')
  const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
    type: 'application/octet-stream',
  })
  saveAs(blob, `Work_Order_Details_Report_${Date.now()}.xlsx`)
}

export function generateExpenseReportV1Excel(
  data: ExpenseReportV1Row[],
  summary: ExpenseReportV1Summary,
  dateRange?: { from: string; to: string }
) {
  const rows = [
    ...headerRows('Expense Report', dateRange),
    ['No', 'Purpose', 'Amount', 'Details', 'Expense Date', 'Work Order', 'Customer', 'Paid By'],
    ...data.map((r) => [
      r.no,
      r.purpose,
      r.amount,
      r.details ?? '',
      r.expense_date,
      r.work_order ?? '',
      r.customer ?? '',
      r.paid_by,
    ]),
    [],
    ['Total expenses', summary.total_expenses],
    ['Count', summary.count],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses')
  const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
    type: 'application/octet-stream',
  })
  saveAs(blob, `Expense_Report_${Date.now()}.xlsx`)
}

export function generateTrendingExcel(
  data: TrendingReportRow[],
  summary: TrendingReportSummary,
  dateRange?: { from: string; to: string }
) {
  const rows = [
    ...headerRows('Trending Report', dateRange),
    ['Period', 'Revenue', 'Expenses', 'Net Profit', 'Order Count'],
    ...data.map((r) => [r.period, r.revenue, r.expenses, r.net_profit, r.order_count]),
    [],
    ['Total revenue', summary.total_revenue],
    ['Total expenses', summary.total_expenses],
    ['Total net profit', summary.total_net_profit],
    ['Total orders', summary.total_orders],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Trending')
  const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
    type: 'application/octet-stream',
  })
  saveAs(blob, `Trending_Report_${Date.now()}.xlsx`)
}
