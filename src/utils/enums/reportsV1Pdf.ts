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
  dateRange?: { from: string; to: string }
) {
  const doc = new jsPDF()
  const y = addReportHeader(doc, 'Balance Sheet Report', dateRange ?? (payload.period ? { from: payload.period.start_date, to: payload.period.end_date } : undefined))
  const d = payload.data
  doc.setFont('helvetica', 'bold')
  doc.text('Income:', 14, y)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(d.income), 60, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Expenses:', 14, y + 8)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(d.expenses), 60, y + 8)
  doc.setFont('helvetica', 'bold')
  doc.text('Net profit:', 14, y + 16)
  doc.setFont('helvetica', 'normal')
  doc.text(fmt(d.net_profit), 60, y + 16)
  doc.setFont('helvetica', 'bold')
  doc.text('Profit margin:', 14, y + 24)
  doc.setFont('helvetica', 'normal')
  doc.text(`${d.profit_margin_percent}%`, 60, y + 24)
  pageFooter(doc)
  doc.save(`Balance_Sheet_Report_${Date.now()}.pdf`)
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
