import { useCallback, useState } from "react"
import { Main } from "@/components/layout/main"
import { useShopStore } from "@/stores/shopStore"
import { useExpenseList } from "@/hooks/useExpense"
import ExpenseTable from "@/components/expense/ExpenseTable"
import { ExpenseProvider } from "@/components/expense/expense-provider"
import ExpenseCreateButton from "@/components/expense/ExpenseCreateButton"
import ExpenseDialogs from "@/components/expense/ExpenseDialogs"

const Expense = () => {
  const shopId = useShopStore((s) => s.currentShopId)

  const [pageIndex, setPageIndex] = useState(0)
  const [searchBy, setSearchBy] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  const pageSize = 10

  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchBy(value)
    setPageIndex(0)
  }, [])

  const handleDateChange = useCallback((from?: Date, to?: Date) => {
    setStartDate(from)
    setEndDate(to)
    setPageIndex(0)
  }, [])

  const { data, isLoading, isError } = useExpenseList(
    shopId || "",
    pageIndex + 1,
    pageSize,
    searchBy,
    startDate,
    endDate
  )

  if (isError) return <p>Error loading expenses.</p>

  const expenses = data?.items || []
  const total = data?.total || 0

  return (
    <ExpenseProvider>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Expense</h2>
            <p className="text-muted-foreground">
              Here is a list of your all expenses
            </p>
          </div>
          <ExpenseCreateButton />
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          {isLoading ? (
            <p>Loading expense data...</p>
          ) : (
            <ExpenseTable
              data={expenses}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
              onSearchChange={handleSearchChange}
              onDateChange={handleDateChange}
            />
          )}
        </div>
      </Main>

      <ExpenseDialogs />
    </ExpenseProvider>
  )
}

export default Expense