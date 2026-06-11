import type { WorkOrderListSummary } from '@/interface/workOrderInterface'
import { cn } from '@/lib/utils'

type WorkOrderSummaryCardsProps = {
  summary?: WorkOrderListSummary
  isLoading?: boolean
}

function formatCurrency(value: number) {
  return `৳${value.toLocaleString('en-IN')}`
}

export function WorkOrderSummaryCards({
  summary,
  isLoading,
}: WorkOrderSummaryCardsProps) {
  const items = [
    { label: 'Orders', value: summary?.total_orders ?? 0, format: String },
    { label: 'Amount', value: summary?.total_amount ?? 0, format: formatCurrency },
    { label: 'Paid', value: summary?.total_paid ?? 0, format: formatCurrency },
    { label: 'Pending', value: summary?.total_pending ?? 0, format: formatCurrency },
  ]

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border bg-muted/40 px-3 py-2 text-sm',
        'sm:gap-x-6'
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-muted-foreground">{item.label}</span>
          {isLoading ? (
            <span className="inline-block h-4 w-12 animate-pulse rounded bg-muted" />
          ) : (
            <span className="font-semibold tabular-nums">
              {item.format(item.value)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
