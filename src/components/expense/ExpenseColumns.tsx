import type { Expense } from '@/interface/expenseInterface'
import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '../customers/DataTableColumnHeader'
import { DataTableRowActions } from './DataTableRowActions'
import { Badge } from '../ui/badge'

export const ExpenseColumns: ColumnDef<Expense>[] = [
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
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='ID' />,
    },
    {
        accessorKey: 'no',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Expense No' />,
    },
    {
        accessorKey: 'workorder',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Work Order' />,
    },
    {
        accessorKey: 'purpose',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Purpose' />,
        cell: ({ row }) => {
            const purpose = row.getValue<string>('purpose')
            return <Badge variant="secondary">{purpose}</Badge>
        },
    },
    {
        accessorKey: 'details',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Details' />,
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
        cell: ({ row }) => {
            const amount = row.getValue<number>('amount')
            return `৳${amount.toLocaleString('en-IN')}`
        },
    },
    {
        accessorKey: 'expense_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const date = row.getValue<string>('expense_date')
            return date ? new Date(date).toLocaleDateString() : '-'
        },
    },
    {
        accessorKey: 'cost_paid_by',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Paid By' />,
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
