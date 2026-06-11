import { useCallback, useMemo, useState } from 'react'
import { Main } from '@/components/layout/main'
import { useExpenseList } from '@/hooks/useExpense'
import ExpenseTable from '@/components/expense/ExpenseTable'
import { ExpenseProvider } from '@/components/expense/expense-provider'
import ExpenseCreateButton from '@/components/expense/ExpenseCreateButton'
import ExpenseDialogs from '@/components/expense/ExpenseDialogs'
import {
  ExpenseFilters,
  expenseFiltersToSearch,
  type ExpenseFilterValues,
} from '@/components/expense/ExpenseFilters'
import { useCustomerList } from '@/hooks/useCustomer'
import { useWorkOrderList } from '@/hooks/useWorkOrder'

const PAGE_SIZE = 10
const EMPTY_FILTERS: ExpenseFilterValues = {}

const Expense = () => {
  const [pageIndex, setPageIndex] = useState(0)
  const [filters, setFilters] = useState<ExpenseFilterValues>(EMPTY_FILTERS)
  const offset = pageIndex * PAGE_SIZE

  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index)
  }, [])

  const handleFiltersChange = useCallback(
    (patch: Partial<ExpenseFilterValues>) => {
      setFilters((prev) => ({ ...prev, ...patch }))
      setPageIndex(0)
    },
    []
  )

  const handleClearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setPageIndex(0)
  }, [])

  const { data: customersData } = useCustomerList(undefined, 1000, 0)
  const { data: workOrdersData } = useWorkOrderList({ limit: 1000, offset: 0 })

  const combinedSearch = useMemo(
    () =>
      expenseFiltersToSearch(
        filters,
        customersData?.data ?? [],
        workOrdersData?.data ?? []
      ),
    [filters, customersData?.data, workOrdersData?.data]
  )

  const { data, isLoading, isError } = useExpenseList(
    combinedSearch,
    PAGE_SIZE,
    offset
  )

  if (isError) return <p>Error loading expenses.</p>

  const expenses = data?.data || []
  const total = data?.total || 0

  return (
    <ExpenseProvider>
      <Main>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Expense</h2>
            <p className="text-muted-foreground">
              Track and filter business expenses
            </p>
          </div>
          <ExpenseCreateButton />
        </div>

        <div className="-mx-4 flex-1 space-y-3 overflow-auto px-4 py-1">
          {isLoading && !data ? (
            <p>Loading expense data...</p>
          ) : (
            <>
              <ExpenseFilters
                values={filters}
                onChange={handleFiltersChange}
                onClear={handleClearFilters}
              />
              <ExpenseTable
                data={expenses}
                pageIndex={pageIndex}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </Main>

      <ExpenseDialogs />
    </ExpenseProvider>
  )
}

export default Expense
