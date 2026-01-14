import { type ColumnDef } from '@tanstack/react-table'
import type { BalanceSheetTableItem, ExpenseReportItem, StockReportItem, StockTrackReportItem, TransactionLedgerDetailItem, TransactionReportItem } from '@/interface/reportInterface'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Badge } from '../ui/badge'

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

// cus/vend ledger table col
export const LedgerReportColumns: ColumnDef<TransactionLedgerDetailItem>[] = [
  {
    accessorKey: 'transactionNo',
    header: 'Ref No',
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
  },
  {
    accessorKey: 'transactionType',
    header: 'Type',
    cell: ({ getValue }) => {
      const type = getValue() as string
      return (
        <Badge variant="secondary" className={`font-medium ${getTransactionTypeColor(type)}`}>
          {type}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'entityName',
    header: 'Party Name',
  },
  {
    accessorKey: 'inventoryName',
    header: 'Item',
  },
  {
    accessorKey: 'quantity',
    header: 'Qty',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ getValue }) => `${parseFloat(getValue() as string).toFixed(2)}`,
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ getValue }) => `${parseFloat(getValue() as string).toFixed(2)}`,
  },
  {
    accessorKey: 'paymentType',
    header: 'Payment',
  },
]

// transactoin report table col
export const TransactionReportColumns: ColumnDef<TransactionReportItem>[] = [
  {
    accessorKey: 'no',
    header: 'Transaction ID',
    cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
  },
  {
    accessorKey: 'transactionType',
    header: 'Type',
    cell: ({ getValue }) => {
      const type = getValue() as string
      return (
        <Badge variant="secondary" className={`font-medium ${getTransactionTypeColor(type)}`}>
          {type}
        </Badge>
      )
    },
  },
  {
    id: 'party',
    header: 'Customer/Vendor',
    accessorFn: (row) => row.vendor?.name ?? row.customer?.name ?? 'N/A',
  },
  {
    id: "itemSummary",
    header: "Items",
    cell: ({ row }) => {
      const details = row.original.details || []

      const fullText = details
        .map(
          (d) =>
            `${d.inventory?.name ?? 'N/A'} (${d.quantity ?? 'N/A'} ${d.unitOfMeasurement?.name ?? 'N/A'})`
        )
        .join(", ")

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[250px] truncate text-xs text-muted-foreground cursor-help">
                {fullText || "N/A"}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs">{fullText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Amount',
    cell: ({ getValue }) => `${Number(getValue()).toFixed(2)}`,
  },
  {
    accessorKey: 'paid',
    header: 'Paid',
    cell: ({ getValue }) => <span className="text-green-600">{Number(getValue()).toFixed(2)}</span>,
  },
  {
    accessorKey: 'pending',
    header: 'Due',
    cell: ({ getValue }) => (
      <span className={Number(getValue()) > 0 ? "text-destructive font-bold" : ""}>
        {Number(getValue()).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: 'paymentType',
    header: 'Method',
  },
]

// expense report table col
export const ExpensesReportColumns: ColumnDef<ExpenseReportItem>[] = [
  {
    accessorKey: "title",
    header: "Title"
  },
  {
    accessorKey: "type",
    header: "Type"
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => `${Number(getValue()).toFixed(2)}`
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ getValue }) => (getValue() as string) || "N/A"
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString()
  },
]

// stock report table col
export const StocksReportColumns: ColumnDef<StockReportItem>[] = [
  {
    accessorKey: "no",
    header: "Ref No"
  },
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ getValue }) => (getValue() as string) || "N/A"
  },
  {
    accessorKey: "quantity",
    header: "Quantity"
  },
  {
    accessorKey: "lastPrice",
    header: "Last Price",
    cell: ({ getValue }) => `${Number(getValue()).toFixed(2)}`
  },
]

// stock report tracking inventory table col
export const StockTrackReportColumns: ColumnDef<StockTrackReportItem>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString()
  },
  {
    accessorKey: "isPurchased",
    header: "Type",
    cell: ({ row }) => {
      const isPurchased = row.original.isPurchased;
      const label = isPurchased ? "PURCHASE" : "SALE";

      return (
        <Badge variant="secondary" className={`font-medium ${getTransactionTypeColor(label)}`}>
          {label}
        </Badge>
      );
    }
  },
  {
    id: "inventory",
    header: "Item Name",
    accessorFn: (row) => row.inventory?.name ?? 'N/A',
  },
  {
    accessorKey: "stock",
    header: "Stock"
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ getValue }) => `${Number(getValue()).toFixed(2)}`
  },
]

// balance sheet table col
export const BalanceSheetReportColumns: ColumnDef<BalanceSheetTableItem>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString()
  },
  {
    accessorKey: "itemType",
    header: "Item Type",
    cell: ({ getValue }) => {
      const type = getValue() as string
      return (
        <Badge variant="secondary" className={`font-medium ${
          type === "transaction" 
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        }`}>
          {type.toUpperCase()}
        </Badge>
      )
    }
  },
  {
    accessorKey: "no",
    header: "Ref No",
    cell: ({ getValue }) => (getValue() as string) || "N/A"
  },
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => {
      const item = row.original
      if (item.itemType === "transaction") {
        const type = item.transactionType || "N/A"
        return (
          <Badge variant="secondary" className={`font-medium ${getTransactionTypeColor(type)}`}>
            {type}
          </Badge>
        )
      } else {
        return <span>{item.expenseType || "N/A"}</span>
      }
    }
  },
  {
    id: "description",
    header: "Description",
    cell: ({ row }) => {
      const item = row.original
      if (item.itemType === "transaction") {
        return item.customerName || item.vendorName || "N/A"
      } else {
        return item.expenseTitle || "N/A"
      }
    }
  },
  {
    id: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const item = row.original
      if (item.itemType === "transaction") {
        return `${(item.totalAmount || 0).toFixed(2)}`
      } else {
        return `${(item.expenseAmount || 0).toFixed(2)}`
      }
    }
  },
  {
    id: "paid",
    header: "Paid",
    cell: ({ row }) => {
      const item = row.original
      if (item.itemType === "transaction" && item.paid !== undefined) {
        return <span className="text-green-600">{item.paid.toFixed(2)}</span>
      }
      return "N/A"
    }
  },
  {
    id: "pending",
    header: "Pending",
    cell: ({ row }) => {
      const item = row.original
      if (item.itemType === "transaction" && item.pending !== undefined) {
        return (
          <span className={item.pending > 0 ? "text-destructive font-bold" : ""}>
            {item.pending.toFixed(2)}
          </span>
        )
      }
      return "N/A"
    }
  },
  {
    accessorKey: "paymentType",
    header: "Payment Method",
    cell: ({ getValue }) => (getValue() as string) || "N/A"
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString()
  },
]