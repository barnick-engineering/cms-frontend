export enum ReportType {
  CUSTOMER_LEDGER = "Customer Ledger",
  VENDOR_LEDGER = "Vendor Ledger",
  TRANSACTION_REPORT = "Transaction Report",
  STOCK_REPORT = "Stock Report",
  STOCK_TRACK_REPORT = "Stock Track Report",
  EXPENSE_REPORT = "Expense Report",
  BALANCE_SHEET = "Balance Sheet",
  // Barnick report types (used on Reports page)
  CUSTOMER_WISE_WORK_ORDER = "Customer Wise Work Order",
  WORK_ORDER_DETAILS = "Work Order Details",
  TRENDING_REPORT = "Trending Report",
}

/** Report types shown on the Reports page (Barnick /api/v1/reports/) */
export const REPORTS_PAGE_TYPES: ReportType[] = [
  ReportType.CUSTOMER_WISE_WORK_ORDER,
  ReportType.BALANCE_SHEET,
  ReportType.WORK_ORDER_DETAILS,
  ReportType.EXPENSE_REPORT,
  ReportType.TRENDING_REPORT,
]