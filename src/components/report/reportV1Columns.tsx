import type { ColumnDef } from '@tanstack/react-table'
import type {
  CustomerWorkOrderReportRow,
  WorkOrderDetailsReportRow,
  ExpenseReportV1Row,
  TrendingReportRow,
} from '@/interface/reportV1Interface'

const formatCurrency = (n: number) => `৳${(n ?? 0).toLocaleString('en-IN')}`
const formatDate = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString() : '–'

export const CustomerWorkOrderReportColumns: ColumnDef<CustomerWorkOrderReportRow>[] = [
  { accessorKey: 'customer_name', header: 'Customer Name' },
  {
    accessorKey: 'total_amount',
    header: 'Total Amount',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: 'total_paid',
    header: 'Total Paid',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: 'pending',
    header: 'Pending',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  { accessorKey: 'order_count', header: 'Order Count' },
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
    header: 'Amount',
    accessorFn: (row) => row.work_order.amount,
    cell: ({ row }) => formatCurrency(row.original.work_order.amount),
  },
  {
    id: 'total_paid',
    header: 'Total Paid',
    accessorFn: (row) => row.work_order.total_paid,
    cell: ({ row }) => formatCurrency(row.original.work_order.total_paid),
  },
  {
    id: 'date',
    header: 'Date',
    accessorFn: (row) => row.work_order.date,
    cell: ({ row }) => formatDate(row.original.work_order.date),
  },
  {
    accessorKey: 'total_expense',
    header: 'Total Expense',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: 'net_profit',
    header: 'Net Profit',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
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
    header: 'Revenue',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: 'expenses',
    header: 'Expenses',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: 'net_profit',
    header: 'Net Profit',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  { accessorKey: 'order_count', header: 'Order Count' },
]
