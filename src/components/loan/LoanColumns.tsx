import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/customers/DataTableColumnHeader'
import type { Loan } from '@/interface/loanInterface'
import { DataTableRowActions } from './DataTableRowActions'

export const LoanColumns: ColumnDef<Loan>[] = [
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
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'loan_for',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Loan For" />,
    cell: ({ row }) => <Badge variant="secondary">{String(row.getValue('loan_for') || '-')}</Badge>,
  },
  {
    accessorKey: 'loan_from',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Loan From" />,
    cell: ({ row }) => String(row.getValue('loan_from') || '-'),
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => {
      const createdAt =
        row.getValue<string>('created_at') || row.original.created_at || row.original.created
      return createdAt ? new Date(createdAt).toLocaleDateString() : '-'
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => `৳${Number(row.getValue('amount') || 0).toLocaleString('en-IN')}`,
  },
  {
    accessorKey: 'paid',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Paid" />,
    cell: ({ row }) => `৳${Number(row.getValue('paid') || 0).toLocaleString('en-IN')}`,
  },
  {
    accessorKey: 'remaining',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Remaining" />,
    cell: ({ row }) => {
      const amount = Number(row.getValue('amount') || 0)
      const paid = Number(row.getValue('paid') || 0)
      return `৳${Math.max(0, amount - paid).toLocaleString('en-IN')}`
    },
  },
  {
    accessorKey: 'remarks',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Remarks" />,
    cell: ({ row }) => String(row.getValue('remarks') || '-'),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
