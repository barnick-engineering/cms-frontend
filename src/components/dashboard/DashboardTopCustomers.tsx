import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CustomerWorkOrderReportResponse } from '@/interface/reportV1Interface'
import { NoDataFound } from '@/components/NoDataFound'
import { buildReportHref } from '@/lib/reports/reportLinks'
import { ReportSlug } from '@/utils/enums/reportType'

type DashboardTopCustomersProps = {
  data?: CustomerWorkOrderReportResponse
  isLoading?: boolean
  reportFrom?: string
  reportTo?: string
}

function formatCurrency(value: number) {
  return `৳${value.toLocaleString('en-IN')}`
}

const TOP_CUSTOMER_COUNT = 5

export function DashboardTopCustomers({
  data,
  isLoading,
  reportFrom,
  reportTo,
}: DashboardTopCustomersProps) {
  const rows = useMemo(() => {
    const all = data?.data ?? []
    return [...all]
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, TOP_CUSTOMER_COUNT)
  }, [data?.data])

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base sm:text-lg">Top customers</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Highest work order value in this period
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 h-8" asChild>
          <Link
            to={buildReportHref(
              ReportSlug.CUSTOMER_WISE_WORK_ORDER,
              reportFrom,
              reportTo
            )}
          >
            View reports
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Loading customers…
          </p>
        ) : rows.length === 0 ? (
          <NoDataFound
            message="No customer data"
            details="Customer totals will appear for this period."
          />
        ) : (
          <div className="space-y-3">
            <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
              <span>Customer</span>
              <span className="text-right">Orders</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Pending</span>
            </div>
            {rows.map((row) => (
              <div
                key={row.customer_id}
                className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_1fr] gap-1 sm:gap-2 items-center border-b last:border-0 py-2 text-sm"
              >
                <div>
                  <Link
                    to={`/customers/${row.customer_id}`}
                    className="font-medium hover:underline text-primary"
                  >
                    {row.customer_name}
                  </Link>
                </div>
                <div className="flex sm:justify-end gap-2 sm:gap-0">
                  <span className="text-muted-foreground sm:hidden text-xs">
                    Orders:
                  </span>
                  <span className="tabular-nums">{row.order_count}</span>
                </div>
                <div className="flex sm:justify-end gap-2 sm:gap-0">
                  <span className="text-muted-foreground sm:hidden text-xs">
                    Amount:
                  </span>
                  <span className="tabular-nums font-medium">
                    {formatCurrency(row.total_amount)}
                  </span>
                </div>
                <div className="flex sm:justify-end gap-2 sm:gap-0">
                  <span className="text-muted-foreground sm:hidden text-xs">
                    Pending:
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCurrency(row.pending)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
