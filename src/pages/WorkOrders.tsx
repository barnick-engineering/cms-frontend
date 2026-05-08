import { useCallback, useMemo, useState } from 'react'
import { Main } from '@/components/layout/main'
import { WorkOrdersProvider } from '@/components/work-orders/work-order-provider'
import { useWorkOrderList } from '@/hooks/useWorkOrder'
import WorkOrderCreateButton from '@/components/work-orders/WorkOrderCreateButton'
import WorkOrderTable from '@/components/work-orders/WorkOrderTable'
import WorkOrderDialogs from '@/components/work-orders/WorkOrderDialogs'
import { useQueries } from '@tanstack/react-query'
import { getWorkOrderById } from '@/api/workOrderApi'
import type { WorkOrderDetailData } from '@/interface/workOrderInterface'

const WorkOrders = () => {
  const [pageIndex, setPageIndex] = useState(0)
  const [searchBy, setSearchBy] = useState('')
  const pageSize = 10
  const offset = pageIndex * pageSize

  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index)
  }, [])

  const handleSearchChange = useCallback((value?: string) => {
    setSearchBy(value || '')
    setPageIndex(0)
  }, [])

  const { data, isLoading, isError } = useWorkOrderList(
    searchBy || undefined,
    pageSize,
    offset
  )

  const workOrders = data?.data || []
  const total = data?.total || 0
  const workOrderDetailsQueries = useQueries({
    queries: workOrders.map((workOrder) => ({
      queryKey: ['workOrders', 'detail-expense-total', workOrder.id],
      queryFn: () => getWorkOrderById(workOrder.id),
      enabled: !!workOrder.id,
    })),
  })

  const normalizedWorkOrders = useMemo(() => {
    const detailsById = new Map(
      workOrderDetailsQueries
        .map((query) => query.data)
        .filter((detail): detail is WorkOrderDetailData => Boolean(detail))
        .map((detail) => {
          const totalExpense =
            detail.expense?.reduce((sum, expenseGroup) => sum + (expenseGroup.total || 0), 0) ?? 0
          return [detail.id, totalExpense]
        })
    )

    return workOrders.map((workOrder) => ({
      ...workOrder,
      total_expense: detailsById.get(workOrder.id) ?? workOrder.total_expense ?? 0,
    }))
  }, [workOrders, workOrderDetailsQueries])

  return (
    <WorkOrdersProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Work Orders</h2>
            <p className='text-muted-foreground'>Here is a list of all your work orders</p>
          </div>
          <WorkOrderCreateButton />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <p>Loading work orders data...</p>
          ) : isError ? (
            <p>Error loading work orders.</p>
          ) : (
            <WorkOrderTable
              data={normalizedWorkOrders}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
              onSearchChange={handleSearchChange}
            />
          )}
        </div>
      </Main>
      <WorkOrderDialogs />
    </WorkOrdersProvider>
  )
}

export default WorkOrders
