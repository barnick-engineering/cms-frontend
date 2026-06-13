import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  ClipboardList,
  Coins,
  FileSpreadsheet,
  LayoutDashboard,
  Package,
  PieChart,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'

/** Legacy enum — kept for exports and backward compatibility */
export enum ReportType {
  CUSTOMER_LEDGER = 'Customer Ledger',
  VENDOR_LEDGER = 'Vendor Ledger',
  TRANSACTION_REPORT = 'Transaction Report',
  STOCK_REPORT = 'Stock Report',
  STOCK_TRACK_REPORT = 'Stock Track Report',
  EXPENSE_REPORT = 'Expense Report',
  BALANCE_SHEET = 'Balance Sheet',
  CUSTOMER_WISE_WORK_ORDER = 'Customer Wise Work Order',
  WORK_ORDER_DETAILS = 'Work Order Details',
  TRENDING_REPORT = 'Trending Report',
}

export enum ReportCategory {
  OVERVIEW = 'overview',
  REVENUE = 'revenue',
  COSTS = 'costs',
  OPERATIONS = 'operations',
}

export enum ReportSlug {
  EXECUTIVE_SUMMARY = 'executive-summary',
  TRENDING = 'trending',
  CUSTOMER_WISE_WORK_ORDER = 'customer-wise-work-order',
  COLLECTIONS_OUTSTANDING = 'collections-outstanding',
  WORK_ORDER_PROFITABILITY = 'work-order-profitability',
  EXPENSE_REPORT = 'expense-report',
  EXPENSE_BY_PURPOSE = 'expense-by-purpose',
  BALANCE_SHEET = 'balance-sheet',
  PRODUCT_MIX = 'product-mix',
  STOCK_REPORT = 'stock-report',
  LOAN_SUMMARY = 'loan-summary',
}

export interface ReportDefinition {
  slug: ReportSlug
  name: string
  description: string
  audience: string
  category: ReportCategory
  icon: LucideIcon
}

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  [ReportCategory.OVERVIEW]: 'Overview',
  [ReportCategory.REVENUE]: 'Revenue & collections',
  [ReportCategory.COSTS]: 'Costs',
  [ReportCategory.OPERATIONS]: 'Operations',
}

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    slug: ReportSlug.EXECUTIVE_SUMMARY,
    name: 'Executive business summary',
    description: 'Cross-functional pulse: revenue, collections, costs, and profit',
    audience: 'Owner / ops manager',
    category: ReportCategory.OVERVIEW,
    icon: LayoutDashboard,
  },
  {
    slug: ReportSlug.TRENDING,
    name: 'Trending report',
    description: 'Revenue, expenses, and profit over time',
    audience: 'Finance / management',
    category: ReportCategory.OVERVIEW,
    icon: TrendingUp,
  },
  {
    slug: ReportSlug.CUSTOMER_WISE_WORK_ORDER,
    name: 'Customer wise work orders',
    description: 'Work order totals by customer',
    audience: 'Sales / accounts',
    category: ReportCategory.REVENUE,
    icon: Users,
  },
  {
    slug: ReportSlug.COLLECTIONS_OUTSTANDING,
    name: 'Collections & outstanding',
    description: 'Collected vs pending and follow-up list',
    audience: 'Sales / accounts',
    category: ReportCategory.REVENUE,
    icon: Coins,
  },
  {
    slug: ReportSlug.WORK_ORDER_PROFITABILITY,
    name: 'Work order profitability',
    description: 'Per-job collected, costs, and realized profit',
    audience: 'Production / finance',
    category: ReportCategory.REVENUE,
    icon: ClipboardList,
  },
  {
    slug: ReportSlug.EXPENSE_REPORT,
    name: 'Expense report',
    description: 'Detailed expense audit list',
    audience: 'Finance',
    category: ReportCategory.COSTS,
    icon: Receipt,
  },
  {
    slug: ReportSlug.EXPENSE_BY_PURPOSE,
    name: 'Expense by purpose',
    description: 'Spend breakdown by purpose — production vs overhead',
    audience: 'Production / finance',
    category: ReportCategory.COSTS,
    icon: PieChart,
  },
  {
    slug: ReportSlug.BALANCE_SHEET,
    name: 'Realized P&L',
    description: 'Collected income, expenses, and margin (pending excluded)',
    audience: 'Finance / owner',
    category: ReportCategory.COSTS,
    icon: FileSpreadsheet,
  },
  {
    slug: ReportSlug.PRODUCT_MIX,
    name: 'Product / item mix',
    description: 'Top items by quantity and revenue',
    audience: 'Production / sales',
    category: ReportCategory.OPERATIONS,
    icon: BarChart3,
  },
  {
    slug: ReportSlug.STOCK_REPORT,
    name: 'Inventory & stock',
    description: 'Stock levels and materials on hand',
    audience: 'Inventory / production',
    category: ReportCategory.OPERATIONS,
    icon: Package,
  },
  {
    slug: ReportSlug.LOAN_SUMMARY,
    name: 'Loans & advances',
    description: 'Loan disbursements and outstanding balances',
    audience: 'Finance',
    category: ReportCategory.OPERATIONS,
    icon: Wallet,
  },
]

export function getReportBySlug(slug: string | undefined): ReportDefinition | undefined {
  if (!slug) return undefined
  return REPORT_DEFINITIONS.find((r) => r.slug === slug)
}

export function getReportsByCategory(category: ReportCategory): ReportDefinition[] {
  return REPORT_DEFINITIONS.filter((r) => r.category === category)
}

/** @deprecated use REPORT_DEFINITIONS */
export const REPORTS_PAGE_TYPES: ReportType[] = [
  ReportType.CUSTOMER_WISE_WORK_ORDER,
  ReportType.BALANCE_SHEET,
  ReportType.WORK_ORDER_DETAILS,
  ReportType.EXPENSE_REPORT,
  ReportType.TRENDING_REPORT,
]
