import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../customers/DataTableColumnHeader'
import { DataTableRowActions } from './DataTableRowActions'
import type { WorkOrderListInterface } from '@/interface/workOrderInterface'
import { Badge } from '../ui/badge'
import {
  getPaymentStatus,
  getPendingAmount,
} from '@/lib/workOrderPaymentStatus'

export const WorkOrderColumns: ColumnDef<WorkOrderListInterface>[] = [
  {
    accessorKey: 'no',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Work Order No' />
    ),
    cell: ({ row }) => {
      const no = row.getValue<string>('no')
      const id = row.original.id
      return (
        <Link
          to={`/work-orders/${id}`}
          className="font-medium text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {no || 'N/A'}
        </Link>
      )
    },
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => {
      const customer = row.getValue<string>('customer')
      const totalItems = row.original.total_items || 0
      return (
        <span>
          {customer || 'N/A'}{' '}
          <span className="text-muted-foreground">
            ({totalItems === 1 ? '1 item' : `${totalItems} items`})
          </span>
        </span>
      )
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => {
      const date = row.getValue<string>('date')
      return date ? new Date(date).toLocaleDateString() : '-'
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue<number>('amount')
      return `৳${amount.toLocaleString('en-IN')}`
    },
  },
  {
    accessorKey: 'total_expense',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Expenses' />
    ),
    cell: ({ row }) => {
      const totalExpense =
        row.getValue<number>('total_expense') || row.original.total_expense || 0
      return `৳${totalExpense.toLocaleString('en-IN')}`
    },
  },
  {
    id: 'net',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Net' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue<number>('amount') || 0
      const totalExpense =
        row.getValue<number>('total_expense') || row.original.total_expense || 0
      const net = amount - totalExpense
      const profitPct =
        totalExpense > 0 ? (net / totalExpense) * 100 : null
      const netStr = `৳${net.toLocaleString('en-IN')}`
      const pctStr =
        profitPct !== null ? ` (${profitPct.toFixed(2)}%)` : ''
      return (
        <span>
          {netStr}
          {pctStr ? (
            <span className="text-muted-foreground">{pctStr}</span>
          ) : null}
        </span>
      )
    },
  },
  {
    accessorKey: 'total_paid',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Paid' />
    ),
    cell: ({ row }) => {
      const totalPaid = row.getValue<number>('total_paid')
      return `৳${totalPaid.toLocaleString('en-IN')}`
    },
  },
  {
    id: 'pending',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pending' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue<number>('amount') || 0
      const totalPaid = row.getValue<number>('total_paid') || 0
      const pending = getPendingAmount(amount, totalPaid)
      return `৳${pending.toLocaleString('en-IN')}`
    },
  },
  {
    id: 'payment_status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const amount = row.original.amount || 0
      const totalPaid = row.original.total_paid || 0
      const status = getPaymentStatus(amount, totalPaid)
      const variant =
        status === 'paid'
          ? 'default'
          : status === 'partial'
            ? 'secondary'
            : 'outline'
      const label =
        status === 'paid' ? 'Paid' : status === 'partial' ? 'Partial' : 'Pending'
      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
