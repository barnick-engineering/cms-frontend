import { useCallback, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { subDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { Main } from '@/components/layout/main'
import LoanCreateButton from '@/components/loan/LoanCreateButton'
import LoanDialogs from '@/components/loan/LoanDialogs'
import LoanTable from '@/components/loan/LoanTable'
import { LoanProvider } from '@/components/loan/loan-provider'
import { useLoanList } from '@/hooks/useLoan'

const Loan = () => {
  const [pageIndex, setPageIndex] = useState(0)
  const [searchBy, setSearchBy] = useState('')
  const [loanForFilter, setLoanForFilter] = useState<string | undefined>()
  const defaultDateRange = useMemo(() => {
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 30)
    return {
      from: thirtyDaysAgo,
      to: today,
    } as DateRange
  }, [])

  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange)

  const pageSize = 10
  const offset = pageIndex * pageSize

  const startDate = useMemo(
    () => (dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined),
    [dateRange]
  )
  const endDate = useMemo(
    () => (dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined),
    [dateRange]
  )

  const handlePageChange = useCallback((index: number) => setPageIndex(index), [])
  const handleSearchChange = useCallback((value?: string) => {
    setSearchBy(value || '')
    setPageIndex(0)
  }, [])
  const handleLoanForFilterChange = useCallback((value?: string) => {
    setLoanForFilter(value)
    setPageIndex(0)
  }, [])
  const handleDateRangeChange = useCallback((from?: Date, to?: Date) => {
    setDateRange(from || to ? { from, to } : undefined)
    setPageIndex(0)
  }, [])

  const { data, isLoading, isError } = useLoanList(
    searchBy || undefined,
    startDate,
    endDate,
    loanForFilter,
    pageSize,
    offset
  )

  if (isError) return <p>Error loading loans.</p>

  const loans = data?.data || []
  const total = data?.total || 0

  return (
    <LoanProvider>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Loan</h2>
            <p className="text-muted-foreground">Here is a list of all your loans</p>
          </div>
          <LoanCreateButton />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          {isLoading ? (
            <p>Loading loan data...</p>
          ) : (
            <LoanTable
              data={loans}
              summary={data?.summary}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
              onSearchChange={handleSearchChange}
              onLoanForFilterChange={handleLoanForFilterChange}
              onDateRangeChange={handleDateRangeChange}
              loanForFilter={loanForFilter}
              dateRange={dateRange}
            />
          )}
        </div>
      </Main>
      <LoanDialogs />
    </LoanProvider>
  )
}

export default Loan
