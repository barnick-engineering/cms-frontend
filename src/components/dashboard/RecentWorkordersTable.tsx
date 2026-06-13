import { Link } from 'react-router-dom'
import { NoDataFound } from '../NoDataFound'
import { Badge } from '@/components/ui/badge'
import { getPaymentStatus } from '@/lib/workOrderPaymentStatus'
import type { DashboardData } from '@/api/dashboardApi'

interface RecentWorkordersTableProps {
  data?: Pick<DashboardData, 'recent_workorders'>
  isLoading?: boolean
}

const RecentWorkordersTable = ({ data, isLoading }: RecentWorkordersTableProps) => {
  const workorders = data?.recent_workorders || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading work orders...</p>
      </div>
    )
  }

  if (workorders.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-sm overflow-auto">
        <NoDataFound
          message="No Recent Work Orders"
          details="Work orders will appear here once created."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_100px] gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-muted-foreground pb-2 border-b">
        <div>Work Order</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Paid</div>
        <div className="text-center">Status</div>
      </div>

      {workorders.map((wo, index) => {
        const status = getPaymentStatus(wo.amount, wo.paid)
        const statusLabel =
          status === 'paid' ? 'Paid' : status === 'partial' ? 'Partial' : 'Pending'
        const statusVariant =
          status === 'paid'
            ? 'default'
            : status === 'partial'
              ? 'secondary'
              : 'outline'

        return (
          <div
            key={wo.id ?? wo.no ?? index}
            className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_100px] gap-2 sm:gap-4 items-start sm:items-center py-2 border-b last:border-0"
          >
            <div className="space-y-1 min-w-0">
              {wo.id ? (
                <Link
                  to={`/work-orders/${wo.id}`}
                  className="text-xs sm:text-sm leading-none font-medium text-primary hover:underline"
                >
                  {wo.no}
                </Link>
              ) : (
                <p className="text-xs sm:text-sm leading-none font-medium">
                  {wo.no}
                </p>
              )}
              <p className="text-muted-foreground text-xs truncate">
                {wo.customer}
              </p>
            </div>

            <div className="flex justify-between sm:justify-end items-center">
              <span className="text-xs sm:hidden text-muted-foreground font-medium">
                Amount:
              </span>
              <span className="font-medium text-right text-xs sm:text-sm tabular-nums">
                ৳{wo.amount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between sm:justify-end items-center">
              <span className="text-xs sm:hidden text-muted-foreground font-medium">
                Paid:
              </span>
              <span className="font-medium text-right text-xs sm:text-sm tabular-nums">
                ৳{wo.paid.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between sm:justify-center items-center">
              <span className="text-xs sm:hidden text-muted-foreground font-medium">
                Status:
              </span>
              <Badge variant={statusVariant} className="text-xs capitalize">
                {statusLabel}
              </Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RecentWorkordersTable
