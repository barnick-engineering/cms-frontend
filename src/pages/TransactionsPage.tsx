import { useCallback, useState, useMemo } from "react"
import { Main } from "@/components/layout/main"
import { TransactionProvider } from "@/components/transactions/transaction-provider"
import TransactionDialogs from "@/components/transactions/TransactionDialogs"
import TransactionPrimaryButtons from "@/components/transactions/TransactionPrimaryButtons"
import TransactionTable from "@/components/transactions/TransactionTable"
import { useShopStore } from "@/stores/shopStore"
import { useTransactionList } from "@/hooks/useTransaction"

const TransactionsPage = () => {
  const shopId = useShopStore((s) => s.currentShopId)
  const [pageIndex, setPageIndex] = useState(0)
  const [searchBy, setSearchBy] = useState('')
  
  // Initialize with last 30 days
  const defaultDateRange = useMemo(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    return {
      from: thirtyDaysAgo,
      to: today
    }
  }, [])
  
  // Initialize state with default range
  const [startDate, setStartDate] = useState<Date | undefined>(defaultDateRange.from)
  const [endDate, setEndDate] = useState<Date | undefined>(defaultDateRange.to)
  const [transactionTypes, setTransactionTypes] = useState<string[]>([])
  const [vendorIds, setVendorIds] = useState<string[]>([])
  const [customerIds, setCustomerIds] = useState<string[]>([])

  const pageSize = 10

  // useCallback ensures stable function references
  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index)
  }, [])

  const handleSearchChange = useCallback((
    value?: string,
    from?: Date,
    to?: Date
  ) => {
    setSearchBy(value || '')
    setStartDate(from)
    setEndDate(to)
  }, [])

  const handleFiltersChange = useCallback((
    types: string[],
    vendors: string[],
    customers: string[]
  ) => {
    setTransactionTypes(types)
    setVendorIds(vendors)
    setCustomerIds(customers)
    setPageIndex(0) // Reset to first page when filters change
  }, [])

  // Format dates to ISO string for API
  const startDateString = startDate ? startDate.toISOString() : undefined
  const endDateString = endDate ? endDate.toISOString() : undefined

  const { data, isLoading, isError } = useTransactionList(
    shopId || '',
    pageIndex + 1,
    pageSize,
    searchBy,
    startDateString,
    endDateString,
    transactionTypes.length > 0 ? transactionTypes : undefined,
    vendorIds.length > 0 ? vendorIds : undefined,
    customerIds.length > 0 ? customerIds : undefined
  )

  if (!shopId) return <div>No shop selected</div>
  if (isError) return <div>Error loading transactions.</div>

  const transactions = data?.data || []
  const total = data?.total || 0

  return (
    <TransactionProvider>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Transactions Board</h2>
            <p className="text-muted-foreground">Here is a list of all your transactions</p>
          </div>
          <TransactionPrimaryButtons />
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          {isLoading ? (
            <p>Loading transactions data...</p>
          ) : (
            <TransactionTable
              shopId={shopId}
              data={transactions}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
              onSearchChange={handleSearchChange}
              onFiltersChange={handleFiltersChange}
              initialDateRange={defaultDateRange} // Pass default date range
            />
          )}
        </div>
      </Main>
      <TransactionDialogs />
    </TransactionProvider>
  )
}

export default TransactionsPage