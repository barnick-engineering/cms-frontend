import { cn } from '@/lib/utils'

type DashboardPeriodSnapshotProps = {
  worked?: number
  paid?: number
  pending?: number
  expenses?: number
  netProfit?: number
  marginPercent?: number
  customers?: number
  workOrders?: number
  products?: number
  isLoading?: boolean
}

function formatCurrency(value: number) {
  return `৳${value.toLocaleString('en-IN')}`
}

export function DashboardPeriodSnapshot({
  worked = 0,
  paid = 0,
  pending = 0,
  expenses = 0,
  netProfit = 0,
  marginPercent,
  customers = 0,
  workOrders = 0,
  products = 0,
  isLoading,
}: DashboardPeriodSnapshotProps) {
  const revenueItems = [
    { label: 'Work value', value: formatCurrency(worked) },
    { label: 'Collected', value: formatCurrency(paid) },
    { label: 'Pending', value: formatCurrency(pending) },
  ]

  const profitItems = [
    { label: 'Expenses', value: formatCurrency(expenses) },
    { label: 'Net profit', value: formatCurrency(netProfit) },
    {
      label: 'Margin',
      value: marginPercent != null ? `${marginPercent.toFixed(1)}%` : '—',
    },
  ]

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border bg-muted/40 px-3 py-2 text-sm',
          'sm:gap-x-6'
        )}
      >
        {revenueItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="text-muted-foreground">{item.label}</span>
            {isLoading ? (
              <span className="inline-block h-4 w-14 animate-pulse rounded bg-muted" />
            ) : (
              <span className="font-semibold tabular-nums">{item.value}</span>
            )}
          </div>
        ))}
        <span className="hidden sm:inline text-muted-foreground/60">|</span>
        {profitItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="text-muted-foreground">{item.label}</span>
            {isLoading ? (
              <span className="inline-block h-4 w-14 animate-pulse rounded bg-muted" />
            ) : (
              <span className="font-semibold tabular-nums">{item.value}</span>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground px-1">
        {isLoading ? (
          <span className="inline-block h-3 w-48 animate-pulse rounded bg-muted" />
        ) : (
          <>
            Net profit and margin use collected amounts only (pending excluded)
            · {customers} customers · {workOrders} work orders · {products}{' '}
            products
          </>
        )}
      </p>
    </div>
  )
}
