import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../customers/DataTableColumnHeader'
import { DataTableRowActions } from './DataTableRowActions'
import type { WorkOrderListInterface } from '@/interface/workOrderInterface'
import { Badge } from '../ui/badge'

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
          {customer || 'N/A'} <span className="text-muted-foreground">({totalItems}) items</span>
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
      const totalExpense = row.getValue<number>('total_expense') || row.original.total_expense || 0
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
      const totalExpense = row.getValue<number>('total_expense') || row.original.total_expense || 0
      const net = amount - totalExpense
      return `৳${net.toLocaleString('en-IN')}`
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
      const amount = row.getValue<number>('amount')
      const totalPaid = row.getValue<number>('total_paid')
      const pending = (amount || 0) - (totalPaid || 0)
      return `৳${pending.toLocaleString('en-IN')}`
    },
  },
  {
    accessorKey: 'is_delivered',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue<number>('amount') || 0
      const totalPaid = row.getValue<number>('total_paid') || 0
      const isPaid = amount <= totalPaid
      return (
        <Badge variant={isPaid ? 'default' : 'secondary'}>
          {isPaid ? 'Paid' : 'Pending'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
