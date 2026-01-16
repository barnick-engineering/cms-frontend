import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '../customers/DataTableColumnHeader'
import { DataTableRowActions } from './DataTableRowActions'
import type { WorkOrderListInterface } from '@/interface/workOrderInterface'
import { Badge } from '../ui/badge'

export const WorkOrderColumns: ColumnDef<WorkOrderListInterface>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        onClick={(e) => e.stopPropagation()}
        aria-label='Select all'
        className='translate-y-0.5'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(e) => e.stopPropagation()}
        aria-label='Select row'
        className='translate-y-0.5'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'no',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Work Order No' />
    ),
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
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
      const isDelivered = row.getValue<boolean>('is_delivered')
      return (
        <Badge variant={isDelivered ? 'default' : 'secondary'}>
          {isDelivered ? 'Delivered' : 'Pending'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
