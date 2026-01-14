import type { ColumnDef } from '@tanstack/react-table'
import type { TransactionLedgerInterface } from '@/interface/transactionInterface'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

export const TransactionLedgerColumn: ColumnDef<TransactionLedgerInterface>[] =
  [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => row.original.no,
    },
    {
      accessorKey: 'transactionType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.transactionType
        return (
          <Badge
            variant={
              type === 'COMMISSION'
                ? 'default'
                : type === 'PAYMENT'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {type}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => {
        const text = row.getValue('remarks') as string || null
        return (
          <Tooltip>
            <TooltipTrigger>
              <div className='max-w-50 truncate'>{text ?? 'N/A'}</div>
            </TooltipTrigger>
            <TooltipContent>
              <div className='max-w-sm wrap-break-word'>{text ?? 'N/A'}</div>
            </TooltipContent>
          </Tooltip>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = Number(row.original.totalAmount ?? 0)
        return `${amount.toLocaleString()}`
      },
    },
    {
      accessorKey: 'paid',
      header: 'Paid',
      cell: ({ row }) => `${row.original.paid.toLocaleString()}`,
    },
    {
      accessorKey: 'pending',
      header: 'Pending',
      cell: ({ row }) => `${row.original.pending.toLocaleString()}`,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)

        const datePart = date.toLocaleDateString('en-GB') // 28/12/2025
        const timePart = date.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }) // 17:27

        return (
          <div className="text-sm">
            <div>{datePart}</div>
            <div className="text-muted-foreground">{timePart}</div>
          </div>
        )
      },
    },
  ]
