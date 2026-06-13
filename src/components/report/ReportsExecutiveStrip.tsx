import { cn } from '@/lib/utils'
import {
  computeMarginOnCollected,
  computeRealizedProfit,
  formatReportCurrency,
} from '@/lib/reports/collectedProfit'

type ReportsExecutiveStripProps = {
  worked?: number
  paid?: number
  pending?: number
  expenses?: number
  isLoading?: boolean
}

export function ReportsExecutiveStrip({
  worked = 0,
  paid = 0,
  pending = 0,
  expenses = 0,
  isLoading,
}: ReportsExecutiveStripProps) {
  const netProfit = computeRealizedProfit(paid, expenses)
  const margin = computeMarginOnCollected(paid, netProfit)

  const items = [
    { label: 'Work value', value: formatReportCurrency(worked) },
    { label: 'Collected', value: formatReportCurrency(paid) },
    { label: 'Pending', value: formatReportCurrency(pending) },
    { label: 'Expenses', value: formatReportCurrency(expenses) },
    { label: 'Realized profit', value: formatReportCurrency(netProfit) },
    {
      label: 'Margin',
      value: margin != null ? `${margin.toFixed(1)}%` : '—',
    },
  ]

  return (
    <div
      className={cn(
        'rounded-lg border bg-muted/40 px-3 py-2',
        'flex flex-wrap items-center gap-x-4 gap-y-2 text-sm'
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-muted-foreground">{item.label}</span>
          {isLoading ? (
            <span className="inline-block h-4 w-14 animate-pulse rounded bg-muted" />
          ) : (
            <span className="font-semibold tabular-nums">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  )
}
