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
import type { ExecutiveSummaryExportData } from '@/utils/enums/reportsV1Pdf'

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
  dateRange?: { from: string; to: string },
  collectedIncome?: number,
  realizedNetProfit?: number,
  realizedMargin?: number
) {
  const d = payload.data
  const period = dateRange ?? (payload.period ? { from: payload.period.start_date, to: payload.period.end_date } : undefined)
  const rows = [
    ...headerRows('Realized P&L Report', period),
    ['Collected income', collectedIncome ?? d.income],
    ['Expenses', d.expenses],
    ['Realized net profit', realizedNetProfit ?? d.net_profit],
    ['Margin on collected (%)', realizedMargin ?? d.profit_margin_percent],
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

export function generateCollectionsOutstandingExcel(
  data: CustomerWorkOrderReportRow[],
  summary: CustomerWorkOrderReportSummary,
  dateRange?: { from: string; to: string }
) {
  const rows = [
    ...headerRows('Collections & Outstanding Report', dateRange),
    ['Customer', 'Work value', 'Collected', 'Pending', 'Orders'],
    ...data.map((r) => [
      r.customer_name,
      r.total_amount,
      r.total_paid,
      r.pending,
      r.order_count,
    ]),
    [],
    ['Grand total amount', summary.grand_total_amount],
    ['Grand total paid', summary.grand_total_paid],
    ['Grand total pending', summary.grand_total_pending],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Collections')
  const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
    type: 'application/octet-stream',
  })
  saveAs(blob, `Collections_Outstanding_Report_${Date.now()}.xlsx`)
}

export function generateExpenseByPurposeExcel(
  data: ExpenseReportV1Row[],
  dateRange?: { from: string; to: string }
) {
  const map = new Map<string, { count: number; amount: number }>()
  for (const row of data) {
    const p = row.purpose?.trim() || 'Other'
    const e = map.get(p) ?? { count: 0, amount: 0 }
    e.count += 1
    e.amount += row.amount
    map.set(p, e)
  }
  const aggregated = Array.from(map.entries())
    .map(([purpose, v]) => [purpose, v.count, v.amount])
    .sort((a, b) => (b[2] as number) - (a[2] as number))

  const rows = [
    ...headerRows('Expense by Purpose Report', dateRange),
    ['Purpose', 'Count', 'Amount'],
    ...aggregated,
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Expense by Purpose')
  const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
    type: 'application/octet-stream',
  })
  saveAs(blob, `Expense_By_Purpose_Report_${Date.now()}.xlsx`)
}

export function generateProductMixExcel(
  data: WorkOrderDetailsReportRow[],
  dateRange?: { from: string; to: string }
) {
  const map = new Map<string, { qty: number; revenue: number }>()
  for (const row of data) {
    for (const item of row.items ?? []) {
      const name = item.item?.trim() || 'Unknown'
      const qty = Number(item.total_order) || 0
      const rev = qty * (Number(item.unit_price) || 0)
      const e = map.get(name) ?? { qty: 0, revenue: 0 }
      e.qty += qty
      e.revenue += rev
      map.set(name, e)
    }
  }
  const aggregated = Array.from(map.entries())
    .map(([item, v]) => [item, v.qty, v.revenue])
    .sort((a, b) => (b[2] as number) - (a[2] as number))

  const rows = [
    ...headerRows('Product Mix Report', dateRange),
    ['Item', 'Quantity', 'Revenue'],
    ...aggregated,
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Product Mix')
  const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
    type: 'application/octet-stream',
  })
  saveAs(blob, `Product_Mix_Report_${Date.now()}.xlsx`)
}

export function generateExecutiveSummaryExcel(
  data: ExecutiveSummaryExportData,
  dateRange?: { from: string; to: string }
) {
  const rows = [
    ...headerRows('Executive Business Summary', dateRange),
    ['Work value', data.worked],
    ['Collected', data.paid],
    ['Pending', data.pending],
    ['Expenses', data.expenses],
    ['Realized profit', data.netProfit],
    [],
    ['Top customers', 'Amount'],
    ...data.topCustomers.map((c) => [c.name, c.amount]),
    [],
    ['Top expense purposes', 'Amount'],
    ...data.topPurposes.map((p) => [p.purpose, p.amount]),
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Executive Summary')
  const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
    type: 'application/octet-stream',
  })
  saveAs(blob, `Executive_Summary_Report_${Date.now()}.xlsx`)
}

export function generateLoanSummaryExcel(
  loans: Array<{
    loan_for: string
    loan_from: string | null
    amount: number
    paid: number
    remaining: number
  }>,
  summary?: { total_loan: number; total_paid: number; total_remaining: number },
  dateRange?: { from: string; to: string }
) {
  const rows = [
    ...headerRows('Loans & Advances Report', dateRange),
    ['Loan for', 'From', 'Amount', 'Paid', 'Remaining'],
    ...loans.map((l) => [
      l.loan_for,
      l.loan_from ?? '',
      l.amount,
      l.paid,
      l.remaining,
    ]),
  ]
  if (summary) {
    rows.push(
      [],
      ['Total loan', summary.total_loan],
      ['Total paid', summary.total_paid],
      ['Outstanding', summary.total_remaining]
    )
  }
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Loans')
  const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
    type: 'application/octet-stream',
  })
  saveAs(blob, `Loan_Summary_Report_${Date.now()}.xlsx`)
}
