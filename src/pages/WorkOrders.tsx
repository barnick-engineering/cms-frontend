import { useCallback, useMemo, useState } from 'react'
import { Main } from '@/components/layout/main'
import { WorkOrdersProvider } from '@/components/work-orders/work-order-provider'
import { useWorkOrderList } from '@/hooks/useWorkOrder'
import WorkOrderCreateButton from '@/components/work-orders/WorkOrderCreateButton'
import WorkOrderTable from '@/components/work-orders/WorkOrderTable'
import WorkOrderDialogs from '@/components/work-orders/WorkOrderDialogs'
import {
  WorkOrderFilters,
  workOrderFiltersToParams,
  type WorkOrderFilterValues,
} from '@/components/work-orders/WorkOrderFilters'
import { WorkOrderSummaryCards } from '@/components/work-orders/WorkOrderSummaryCards'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { messageFromAxiosError } from '@/lib/barnickApiError'

const PAGE_SIZE = 10

const EMPTY_FILTERS: WorkOrderFilterValues = {}

const WorkOrders = () => {
  const [pageIndex, setPageIndex] = useState(0)
  const [filters, setFilters] = useState<WorkOrderFilterValues>(EMPTY_FILTERS)

  const offset = pageIndex * PAGE_SIZE

  const listParams = useMemo(
    () => workOrderFiltersToParams(filters, { limit: PAGE_SIZE, offset }),
    [filters, offset]
  )

  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index)
  }, [])

  const handleFiltersChange = useCallback(
    (patch: Partial<WorkOrderFilterValues>) => {
      setFilters((prev) => ({ ...prev, ...patch }))
      setPageIndex(0)
    },
    []
  )

  const handleClearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setPageIndex(0)
  }, [])

  const { data, isLoading, isError, error, isFetching } = useWorkOrderList(listParams)

  const workOrders = data?.data ?? []
  const total = data?.total ?? 0
  const summary = data?.summary

  return (
    <WorkOrdersProvider>
      <Main>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Work Orders</h2>
            <p className='text-muted-foreground'>
              Filter, search, and manage work orders
            </p>
          </div>
          <WorkOrderCreateButton />
        </div>

        <div className='-mx-4 flex-1 space-y-3 overflow-auto px-4 py-1'>
          <WorkOrderSummaryCards
            summary={summary}
            isLoading={isLoading && !data}
          />

          {isError ? (
            <Alert variant="destructive">
              <AlertTitle>Error loading work orders</AlertTitle>
              <AlertDescription>
                {messageFromAxiosError(error)}
              </AlertDescription>
            </Alert>
          ) : isLoading && !data ? (
            <p>Loading work orders data...</p>
          ) : (
            <>
              <WorkOrderFilters
                values={filters}
                onChange={handleFiltersChange}
                onClear={handleClearFilters}
              />
              <WorkOrderTable
                data={workOrders}
                pageIndex={pageIndex}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={handlePageChange}
              />
            </>
          )}

          {isFetching && !isLoading && (
            <p className="text-xs text-muted-foreground">Updating results…</p>
          )}
        </div>
      </Main>
      <WorkOrderDialogs />
    </WorkOrdersProvider>
  )
}

export default WorkOrders
