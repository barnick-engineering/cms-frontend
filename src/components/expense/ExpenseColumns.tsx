import type { ExpenseItemInterface } from '@/interface/expenseInterface'
import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '../customers/DataTableColumnHeader'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { DataTableRowActions } from './DataTableRowActions'
import { ChevronRight } from 'lucide-react'

export const ExpenseColumns: ColumnDef<ExpenseItemInterface>[] = [
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
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
    },
    {
        accessorKey: 'type',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
        cell: ({ row }) => {
            const value = row.getValue<number>('amount')
            return <>{value}</>
        },
    },
    {
        accessorKey: 'remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />,
        cell: ({ row }) => {
            const text = row.getValue<string>('remarks')
            if (!text) return null
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className='max-w-50 truncate cursor-help'>{text}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className='max-w-xs wrap-break-word'>{text}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
    },
    {
        id: 'open',
        header: '',
        cell: () => (
            <div className="flex justify-center">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />, // Implement ExpenseRowActions
    },
]