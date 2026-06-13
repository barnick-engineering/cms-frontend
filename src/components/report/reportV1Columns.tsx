import { Link } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import type {
  CustomerWorkOrderReportRow,
  WorkOrderDetailsReportRow,
  ExpenseReportV1Row,
  TrendingReportRow,
} from '@/interface/reportV1Interface'
import {
  computeRealizedProfit,
  computeCollectionRate,
  computePendingAmount,
} from '@/lib/reports/collectedProfit'

const formatCurrency = (n: number) => `৳${(n ?? 0).toLocaleString('en-IN')}`
const formatDate = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString() : '–'

export const CustomerWorkOrderReportColumns: ColumnDef<CustomerWorkOrderReportRow>[] = [
  {
    accessorKey: 'customer_name',
    header: 'Customer',
    cell: ({ row }) => (
      <Link
        to={`/customers/${row.original.customer_id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.customer_name}
      </Link>
    ),
  },
  {
    accessorKey: 'total_amount',
    header: 'Work value',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: 'total_paid',
    header: 'Collected',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: 'pending',
    header: 'Pending',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    id: 'collection_rate',
    header: 'Collection %',
    cell: ({ row }) => {
      const rate = computeCollectionRate(
        row.original.total_amount,
        row.original.total_paid
      )
      return `${rate.toFixed(1)}%`
    },
  },
  { accessorKey: 'order_count', header: 'Orders' },
]

export const WorkOrderDetailsReportColumns: ColumnDef<WorkOrderDetailsReportRow>[] = [
  {
    id: 'no',
    header: 'WO No',
    accessorFn: (row) => row.work_order.no,
  },
  {
    id: 'customer',
    header: 'Customer',
    accessorFn: (row) => row.work_order.customer,
  },
  {
    id: 'amount',
    header: 'Work value',
    accessorFn: (row) => row.work_order.amount,
    cell: ({ row }) => formatCurrency(row.original.work_order.amount),
  },
  {
    id: 'total_paid',
    header: 'Collected',
    accessorFn: (row) => row.work_order.total_paid,
    cell: ({ row }) => formatCurrency(row.original.work_order.total_paid),
  },
  {
    id: 'pending',
    header: 'Pending',
    cell: ({ row }) => {
      const wo = row.original.work_order
      return formatCurrency(computePendingAmount(wo.amount, wo.total_paid))
    },
  },
  {
    id: 'date',
    header: 'Date',
    accessorFn: (row) => row.work_order.date,
    cell: ({ row }) => formatDate(row.original.work_order.date),
  },
  {
    accessorKey: 'total_expense',
    header: 'Expenses',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    id: 'realized_profit',
    header: 'Realized profit',
    cell: ({ row }) => {
      const wo = row.original.work_order
      const profit = computeRealizedProfit(wo.total_paid, row.original.total_expense)
      return formatCurrency(profit)
    },
  },
]

export const ExpenseReportV1Columns: ColumnDef<ExpenseReportV1Row>[] = [
  { accessorKey: 'no', header: 'No' },
  { accessorKey: 'purpose', header: 'Purpose' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: 'details',
    header: 'Details',
    cell: ({ getValue }) => (getValue() as string) || '–',
  },
  {
    accessorKey: 'expense_date',
    header: 'Expense Date',
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: 'bill_disbursed_date',
    header: 'Bill Disbursed Date',
    cell: ({ getValue }) => formatDate(getValue() as string | null),
  },
  {
    accessorKey: 'work_order',
    header: 'Work Order',
    cell: ({ getValue }) => (getValue() as string) || '–',
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ getValue }) => (getValue() as string) || '–',
  },
  { accessorKey: 'paid_by', header: 'Paid By' },
  {
    accessorKey: 'remarks',
    header: 'Remarks',
    cell: ({ getValue }) => (getValue() as string) || '–',
  },
]

export const TrendingReportColumns: ColumnDef<TrendingReportRow>[] = [
  { accessorKey: 'period', header: 'Period' },
  {
    accessorKey: 'revenue',
    header: 'Revenue (work value)',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: 'expenses',
    header: 'Expenses',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: 'net_profit',
    header: 'Net profit',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  { accessorKey: 'order_count', header: 'Orders' },
]
