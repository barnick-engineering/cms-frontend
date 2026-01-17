import { useCallback, useState, useMemo } from "react"
import { Main } from "@/components/layout/main"
import { useExpenseList } from "@/hooks/useExpense"
import ExpenseTable from "@/components/expense/ExpenseTable"
import { ExpenseProvider } from "@/components/expense/expense-provider"
import ExpenseCreateButton from "@/components/expense/ExpenseCreateButton"
import ExpenseDialogs from "@/components/expense/ExpenseDialogs"
import { useCustomerList } from "@/hooks/useCustomer"
import { useWorkOrderList } from "@/hooks/useWorkOrder"

const Expense = () => {
  const [pageIndex, setPageIndex] = useState(0)
  const [searchBy, setSearchBy] = useState("")
  const [customerFilter, setCustomerFilter] = useState<string | number | undefined>()
  const [workOrderFilter, setWorkOrderFilter] = useState<string | number | undefined>()
  const [purposeFilter, setPurposeFilter] = useState<string | undefined>()
  const pageSize = 10
  const offset = pageIndex * pageSize

  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index)
  }, [])

  const handleSearchChange = useCallback((value?: string) => {
    setSearchBy(value || "")
    setPageIndex(0)
  }, [])

  const handleCustomerFilterChange = useCallback((value?: string | number) => {
    setCustomerFilter(value)
    setPageIndex(0)
  }, [])

  const handleWorkOrderFilterChange = useCallback((value?: string | number) => {
    setWorkOrderFilter(value)
    setPageIndex(0)
  }, [])

  const handlePurposeFilterChange = useCallback((value?: string) => {
    setPurposeFilter(value)
    setPageIndex(0)
  }, [])

  // Fetch customer and work order data to convert IDs to names
  const { data: customersData } = useCustomerList(undefined, 1000, 0)
  const { data: workOrdersData } = useWorkOrderList(undefined, 1000, 0)

  // Convert filter IDs to names and combine with search text
  const combinedSearch = useMemo(() => {
    const searchParts: string[] = []
    
    // Add text search if provided
    if (searchBy) {
      searchParts.push(searchBy)
    }
    
    // Add customer name filter if selected
    if (customerFilter) {
      const customer = customersData?.data?.find(c => String(c.id) === String(customerFilter))
      if (customer?.name) {
        searchParts.push(customer.name)
      }
    }
    
    // Add work order number filter if selected
    if (workOrderFilter) {
      const workOrder = workOrdersData?.data?.find(wo => String(wo.id) === String(workOrderFilter))
      if (workOrder?.no) {
        searchParts.push(workOrder.no)
      }
    }
    
    // Add purpose filter if selected
    if (purposeFilter) {
      searchParts.push(purposeFilter)
    }
    
    // Combine all search parts with space (backend will search across all fields)
    return searchParts.length > 0 ? searchParts.join(" ") : undefined
  }, [searchBy, customerFilter, workOrderFilter, purposeFilter, customersData, workOrdersData])

  const { data, isLoading, isError } = useExpenseList(
    combinedSearch,
    pageSize,
    offset
  )

  if (isError) return <p>Error loading expenses.</p>

  const expenses = data?.data || []
  const total = data?.total || 0

  return (
    <ExpenseProvider>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Expense</h2>
            <p className="text-muted-foreground">
              Here is a list of all your expenses
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
              onCustomerFilterChange={handleCustomerFilterChange}
              onWorkOrderFilterChange={handleWorkOrderFilterChange}
              onPurposeFilterChange={handlePurposeFilterChange}
              customerFilter={customerFilter}
              workOrderFilter={workOrderFilter}
              purposeFilter={purposeFilter}
            />
          )}
        </div>
      </Main>

      <ExpenseDialogs />
    </ExpenseProvider>
  )
}

export default Expense
