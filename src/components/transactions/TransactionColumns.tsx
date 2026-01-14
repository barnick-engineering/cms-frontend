import { type ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router-dom'
import type { Transaction } from '@/interface/transactionInterface'
import { ChevronRight } from 'lucide-react'
import { Tooltip, TooltipContent } from '../ui/tooltip'
import { TooltipTrigger } from '@radix-ui/react-tooltip'
import { Badge } from '../ui/badge'
import { TransactionsLedgerDownload } from './TransactionsLedgerDownload'

const getTransactionTypeColor = (type: string) => {
  switch (type) {
    case 'PURCHASE':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'SALE':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'PAYMENT':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'RECEIVABLE':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'COMMISSION':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
}

export const TransactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'no',
    header: 'No',
  },
  {
    accessorKey: 'transactionType',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.transactionType
      return (
        <Badge variant="secondary" className={`font-medium ${getTransactionTypeColor(type)}`}>
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
          <TooltipTrigger asChild>
            <div className="max-w-50 truncate">{text ?? 'N/A'}</div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-sm wrap-break-word">{text ?? 'N/A'}</div>
          </TooltipContent>
        </Tooltip>
      )
    }
  },
  {
    id: 'partnerName',
    header: 'Vendor/Customer Name',
    cell: ({ row }) => {
      const data = row.original

      const handleLinkClick = (e: React.MouseEvent) => {
        // prevent triggering row click
        e.stopPropagation()
      }

      if (data.vendor) {
        return (
          <Link
            to={`/transactions/ledger/vendor/${data.vendor.id}`}
            onClick={handleLinkClick}
            className='font-medium text-blue-600 hover:underline'
          >
            {data.vendor.name}
          </Link>
        )
      }

      if (data.customer) {
        return (
          <Link
            to={`/transactions/ledger/customer/${data.customer.id}`}
            onClick={handleLinkClick}
            className='font-medium text-blue-600 hover:underline'
          >
            {data.customer.name}
          </Link>
        )
      }
      return <span className='text-gray-500'>-</span>
    },
  },
  {
    id: 'amounts',
    header: 'Total / Paid / Pending',
    cell: ({ row }) => {
      const data = row.original
      const total = data.totalAmount
      const paid = data.paid
      const pending = data.pending

      return (
        <div className="font-mono">
          {total.toFixed(2)} / {paid.toFixed(2)} / {pending.toFixed(2)}
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return date.toLocaleDateString()
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
    id: 'ledger',
    header: '',
    cell: ({ row }) => (
      <TransactionsLedgerDownload transaction={row.original} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]