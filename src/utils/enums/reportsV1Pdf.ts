import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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
const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'Company Name'
const fmt = (n: number) => (n ?? 0).toLocaleString('en-IN')
const pageFooter = (doc: jsPDF) => {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text(`Powered by ${COMPANY_NAME}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' })
  }
}

function addReportHeader(doc: jsPDF, title: string, dateRange?: { from: string; to: string }) {
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(REPORT_HEADER, pageWidth / 2, 14, { align: 'center' })
  doc.setFontSize(14)
  doc.text(title, pageWidth / 2, 22, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const period = dateRange
    ? `${new Date(dateRange.from).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} to ${new Date(dateRange.to).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : 'All time'
  doc.text(`Period: ${period}`, 14, 30)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 14, 30, { align: 'right' })
  doc.setDrawColor(200, 200, 200)
  doc.line(14, 34, pageWidth - 14, 34)
  return 40
}

export function generateCustomerWorkOrdersPdf(
  data: CustomerWorkOrderReportRow[],
  summary: CustomerWorkOrderReportSummary,
  dateRange?: { from: string; to: string }
) {
  const doc = new jsPDF()
  let y = addReportHeader(doc, 'Customer Wise Work Order Report', dateRange)
  const tableRows = data.map((r) => [
    r.customer_name,
    fmt(r.total_amount),
    fmt(r.total_paid),
    fmt(r.pending),
    String(r.order_count),
  ])
  autoTable(doc, {
    startY: y,
    head: [['Customer', 'Total Amount', 'Total Paid', 'Pending', 'Orders']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: 'center' },
    styles: { fontSize: 9 },
  })
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  doc.setFont('helvetica', 'bold')
  doc.text(`Total customers: ${summary.total_customers}`, 14, y)
  doc.text(`Grand total amount: ${fmt(summary.grand_total_amount)}`, 14, y + 6)
  doc.text(`Grand total paid: ${fmt(summary.grand_total_paid)}`, 14, y + 12)
  doc.text(`Grand total pending: ${fmt(summary.grand_total_pending)}`, 14, y + 18)
  pageFooter(doc)
  doc.save(`Customer_Work_Orders_Report_${Date.now()}.pdf`)
}

export function generateBalanceSheetPdf(
  payload: BalanceSheetReportResponse,
  dateRange?: { from: string; to: string },
  collectedIncome?: number,
  realizedNetProfit?: number,
  realizedMargin?: number
) {
  const doc = new jsPDF()
  const y = addReportHeader(doc, 'Realized P&L Report', dateRange ?? (payload.period ? { from: payload.period.start_date, to: payload.period.end_date } : undefined))
  const d = payload.data
  const income = collectedIncome ?? d.income
  const profit = realizedNetProfit ?? d.net_profit
  const margin = realizedMargin ?? d.profit_margin_percent
  doc.setFont('helvetica', 'bold')
  doc.text('Collected income:', 14, y)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(income), 80, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Expenses:', 14, y + 8)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(d.expenses), 80, y + 8)
  doc.setFont('helvetica', 'bold')
  doc.text('Realized net profit:', 14, y + 16)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(profit), 80, y + 16)
  doc.setFont('helvetica', 'bold')
  doc.text('Margin on collected:', 14, y + 24)
  doc.setFont('helvetica', 'normal')
  doc.text(`${margin?.toFixed(1) ?? d.profit_margin_percent}%`, 80, y + 24)
  pageFooter(doc)
  doc.save(`Realized_PL_Report_${Date.now()}.pdf`)
}

export function generateWorkOrderDetailsPdf(
  data: WorkOrderDetailsReportRow[],
  dateRange?: { from: string; to: string }
) {
  const doc = new jsPDF()
  let y = addReportHeader(doc, 'Work Order Details Report', dateRange)
  const tableRows = data.map((r) => [
    r.work_order.no,
    r.work_order.customer,
    fmt(r.work_order.amount),
    fmt(r.work_order.total_paid),
    r.work_order.date,
    fmt(r.total_expense),
    fmt(r.net_profit),
  ])
  autoTable(doc, {
    startY: y,
    head: [['WO No', 'Customer', 'Amount', 'Total Paid', 'Date', 'Total Expense', 'Net Profit']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: 'center' },
    styles: { fontSize: 8 },
  })
  pageFooter(doc)
  doc.save(`Work_Order_Details_Report_${Date.now()}.pdf`)
}

export function generateExpenseReportV1Pdf(
  data: ExpenseReportV1Row[],
  summary: ExpenseReportV1Summary,
  dateRange?: { from: string; to: string }
) {
  const doc = new jsPDF('landscape')
  let y = addReportHeader(doc, 'Expense Report', dateRange)
  const tableRows = data.map((r) => [
    r.no,
    r.purpose,
    fmt(r.amount),
    (r.details ?? '').slice(0, 30),
    r.expense_date,
    r.work_order ?? '–',
    r.customer ?? '–',
    r.paid_by,
  ])
  autoTable(doc, {
    startY: y,
    head: [['No', 'Purpose', 'Amount', 'Details', 'Date', 'Work Order', 'Customer', 'Paid By']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: 'center' },
    styles: { fontSize: 8 },
  })
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  doc.setFont('helvetica', 'bold')
  doc.text(`Total expenses: ${fmt(summary.total_expenses)}  |  Count: ${summary.count}`, 14, finalY)
  pageFooter(doc)
  doc.save(`Expense_Report_${Date.now()}.pdf`)
}

export function generateTrendingPdf(
  data: TrendingReportRow[],
  summary: TrendingReportSummary,
  dateRange?: { from: string; to: string }
) {
  const doc = new jsPDF()
  let y = addReportHeader(doc, 'Trending Report', dateRange)
  const tableRows = data.map((r) => [
    r.period,
    fmt(r.revenue),
    fmt(r.expenses),
    fmt(r.net_profit),
    String(r.order_count),
  ])
  autoTable(doc, {
    startY: y,
    head: [['Period', 'Revenue', 'Expenses', 'Net Profit', 'Orders']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: 'center' },
    styles: { fontSize: 9 },
  })
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  doc.setFont('helvetica', 'bold')
  doc.text(`Total revenue: ${fmt(summary.total_revenue)}`, 14, y)
  doc.text(`Total expenses: ${fmt(summary.total_expenses)}`, 14, y + 6)
  doc.text(`Total net profit: ${fmt(summary.total_net_profit)}`, 14, y + 12)
  doc.text(`Total orders: ${summary.total_orders}`, 14, y + 18)
  pageFooter(doc)
  doc.save(`Trending_Report_${Date.now()}.pdf`)
}

export function generateCollectionsOutstandingPdf(
  data: CustomerWorkOrderReportRow[],
  summary: CustomerWorkOrderReportSummary | undefined,
  dateRange?: { from: string; to: string },
  collected?: number,
  pending?: number
) {
  const doc = new jsPDF()
  let y = addReportHeader(doc, 'Collections & Outstanding Report', dateRange)
  if (summary) {
    doc.setFont('helvetica', 'bold')
    doc.text(`Collected: ${fmt(collected ?? summary.grand_total_paid)}`, 14, y)
    doc.text(`Outstanding: ${fmt(pending ?? summary.grand_total_pending)}`, 14, y + 6)
    y += 14
  }
  autoTable(doc, {
    startY: y,
    head: [['Customer', 'Work value', 'Collected', 'Pending', 'Orders']],
    body: data.map((r) => [
      r.customer_name,
      fmt(r.total_amount),
      fmt(r.total_paid),
      fmt(r.pending),
      String(r.order_count),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: 'center' },
    styles: { fontSize: 9 },
  })
  pageFooter(doc)
  doc.save(`Collections_Outstanding_Report_${Date.now()}.pdf`)
}

export function generateExpenseByPurposePdf(
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
  const rows = Array.from(map.entries())
    .map(([purpose, v]) => [purpose, String(v.count), fmt(v.amount)])
    .sort((a, b) => Number(b[2].replace(/,/g, '')) - Number(a[2].replace(/,/g, '')))

  const doc = new jsPDF()
  const y = addReportHeader(doc, 'Expense by Purpose Report', dateRange)
  autoTable(doc, {
    startY: y,
    head: [['Purpose', 'Count', 'Amount']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: 'center' },
    styles: { fontSize: 9 },
  })
  pageFooter(doc)
  doc.save(`Expense_By_Purpose_Report_${Date.now()}.pdf`)
}

export function generateProductMixPdf(
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
  const rows = Array.from(map.entries())
    .map(([item, v]) => [item, String(v.qty), fmt(v.revenue)])
    .sort((a, b) => Number(b[2].replace(/,/g, '')) - Number(a[2].replace(/,/g, '')))

  const doc = new jsPDF()
  const y = addReportHeader(doc, 'Product Mix Report', dateRange)
  autoTable(doc, {
    startY: y,
    head: [['Item', 'Quantity', 'Revenue']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: 'center' },
    styles: { fontSize: 9 },
  })
  pageFooter(doc)
  doc.save(`Product_Mix_Report_${Date.now()}.pdf`)
}

export type ExecutiveSummaryExportData = {
  worked: number
  paid: number
  pending: number
  expenses: number
  netProfit: number
  workOrders?: number
  customers?: number
  topCustomers: Array<{ name: string; amount: number }>
  topPurposes: Array<{ purpose: string; amount: number }>
}

export function generateExecutiveSummaryPdf(
  data: ExecutiveSummaryExportData,
  dateRange?: { from: string; to: string }
) {
  const doc = new jsPDF()
  let y = addReportHeader(doc, 'Executive Business Summary', dateRange)
  doc.setFont('helvetica', 'bold')
  doc.text(`Work value: ${fmt(data.worked)}`, 14, y)
  doc.text(`Collected: ${fmt(data.paid)}`, 14, y + 6)
  doc.text(`Pending: ${fmt(data.pending)}`, 14, y + 12)
  doc.text(`Expenses: ${fmt(data.expenses)}`, 14, y + 18)
  doc.text(`Realized profit: ${fmt(data.netProfit)}`, 14, y + 24)
  y += 34

  if (data.topCustomers.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Top customers', 'Amount']],
      body: data.topCustomers.map((c) => [c.name, fmt(c.amount)]),
      theme: 'striped',
      styles: { fontSize: 9 },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  }

  if (data.topPurposes.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Top expense purposes', 'Amount']],
      body: data.topPurposes.map((p) => [p.purpose, fmt(p.amount)]),
      theme: 'striped',
      styles: { fontSize: 9 },
    })
  }

  pageFooter(doc)
  doc.save(`Executive_Summary_Report_${Date.now()}.pdf`)
}

export function generateLoanSummaryPdf(
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
  const doc = new jsPDF()
  let y = addReportHeader(doc, 'Loans & Advances Report', dateRange)
  if (summary) {
    doc.setFont('helvetica', 'bold')
    doc.text(`Total loan: ${fmt(summary.total_loan)}`, 14, y)
    doc.text(`Total paid: ${fmt(summary.total_paid)}`, 14, y + 6)
    doc.text(`Outstanding: ${fmt(summary.total_remaining)}`, 14, y + 12)
    y += 20
  }
  autoTable(doc, {
    startY: y,
    head: [['Loan for', 'From', 'Amount', 'Paid', 'Remaining']],
    body: loans.map((l) => [
      l.loan_for,
      l.loan_from ?? '—',
      fmt(l.amount),
      fmt(l.paid),
      fmt(l.remaining),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: 'center' },
    styles: { fontSize: 9 },
  })
  pageFooter(doc)
  doc.save(`Loan_Summary_Report_${Date.now()}.pdf`)
}
