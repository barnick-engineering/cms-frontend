import { NoDataFound } from "../NoDataFound"

interface Transaction {
  id: string
  no: string
  partnerType: "CUSTOMER" | "VENDOR"
  transactionType: "SALE" | "PURCHASE"
  totalAmount: number
  paid: number
  pending: number
  createdAt: string
  partnerName?: string
  avatar?: string
}

interface RecentTransactionsTableProps {
  data:
  | {
    recentTransactions: Transaction[]
  }
  | undefined
}

const RecentTransactionsTable = ({ data }: RecentTransactionsTableProps) => {
  // handles undefined or data
  const transactions = data?.recentTransactions || []

  const lastFiveTransactions = transactions.slice(0, 5)

  if (lastFiveTransactions.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-sm overflow-auto">
        <NoDataFound
          message="No Recent Transactions"
          details="Create a transaction to get started."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-[1fr_120px_120px] gap-4 text-sm font-semibold text-muted-foreground">
        <div>
          <p>Type</p>
        </div>
        <div className="text-right">Total</div>
        <div className="text-right">Pending</div>
      </div>

      {/* Data Rows */}
      {lastFiveTransactions.map((tx) => (
        <div key={tx.id} className="grid grid-cols-[1fr_120px_120px] gap-4 items-center">
          <div className="space-y-1">
            <p className="text-sm leading-none font-medium">
              {tx.transactionType}
            </p>
            <p className="text-muted-foreground text-sm">{tx.no}</p>
          </div>

          <div className="font-medium text-right">
            {Number(tx.totalAmount ? tx.totalAmount : tx?.paid ? tx?.paid : 0).toLocaleString()}
          </div>

          <div className="font-medium text-right">
            {tx.pending.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentTransactionsTable