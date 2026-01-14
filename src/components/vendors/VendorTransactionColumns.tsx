import type { ColumnDef } from '@tanstack/react-table'
import type { VendorTransactionInterface } from '@/interface/vendorInterface'
import { Badge } from '@/components/ui/badge'

export const VendorTransactionColumns: ColumnDef<VendorTransactionInterface>[] =
  [
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
      accessorKey: 'transactionStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.transactionStatus
        return (
          <Badge variant={status === 'PAID' ? 'default' : 'destructive'}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `${row.original.amount}`,
    },
    {
      accessorKey: 'paid',
      header: 'Paid',
      cell: ({ row }) => `${row.original.paid}`,
    },
    {
      accessorKey: 'pending',
      header: 'Pending',
      cell: ({ row }) => `${row.original.pending}`,
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
  ]
