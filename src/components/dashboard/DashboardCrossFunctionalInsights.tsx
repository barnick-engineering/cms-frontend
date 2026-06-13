import {
  AlertCircle,
  Percent,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type InsightMetric = {
  id: string
  label: string
  value: string
  subtext: string
  percent?: number
  icon: typeof TrendingUp
}

type DashboardCrossFunctionalInsightsProps = {
  worked?: number
  paid?: number
  pending?: number
  expenses?: number
  netProfit?: number
  marginPercent?: number
  activeCustomers?: number
  expenseCount?: number
  totalExpenseAmount?: number
  isLoading?: boolean
}

function formatCurrency(value: number) {
  return `৳${value.toLocaleString('en-IN')}`
}

function MetricBar({ percent, className }: { percent: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className={cn('h-1.5 w-full rounded-full bg-muted overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-foreground/70 transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export function DashboardCrossFunctionalInsights({
  worked = 0,
  paid = 0,
  pending = 0,
  expenses = 0,
  netProfit = 0,
  marginPercent,
  activeCustomers = 0,
  expenseCount = 0,
  totalExpenseAmount = 0,
  isLoading,
}: DashboardCrossFunctionalInsightsProps) {
  const collectionRate = worked > 0 ? (paid / worked) * 100 : 0
  const pendingShare = worked > 0 ? (pending / worked) * 100 : 0
  const expenseRatio = worked > 0 ? (expenses / worked) * 100 : 0
  const profitMargin =
    marginPercent ?? (paid > 0 ? (netProfit / paid) * 100 : 0)

  const metrics: InsightMetric[] = [
    {
      id: 'collection',
      label: 'Collection rate',
      value: `${collectionRate.toFixed(1)}%`,
      subtext: `${formatCurrency(paid)} of ${formatCurrency(worked)} collected`,
      percent: collectionRate,
      icon: Percent,
    },
    {
      id: 'pending',
      label: 'Outstanding share',
      value: `${pendingShare.toFixed(1)}%`,
      subtext: `${formatCurrency(pending)} still to collect`,
      percent: pendingShare,
      icon: AlertCircle,
    },
    {
      id: 'expenses',
      label: 'Cost intensity',
      value: `${expenseRatio.toFixed(1)}%`,
      subtext: `${expenseCount} expenses · ${formatCurrency(totalExpenseAmount || expenses)}`,
      percent: expenseRatio,
      icon: TrendingUp,
    },
    {
      id: 'customers',
      label: 'Active customers',
      value: String(activeCustomers),
      subtext: `Profit margin ${profitMargin.toFixed(1)}% on collected`,
      percent: Math.min(100, activeCustomers * 10),
      icon: Users,
    },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Period insights</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Cross-functional signals for the selected date range
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="rounded-lg border bg-muted/20 px-3 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <metric.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </div>
              {isLoading ? (
                <div className="mt-2 space-y-2">
                  <div className="h-7 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-1.5 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                </div>
              ) : (
                <>
                  <p className="mt-1 text-xl font-bold tabular-nums">
                    {metric.value}
                  </p>
                  <MetricBar percent={metric.percent ?? 0} className="mt-2" />
                  <p className="mt-2 text-xs text-muted-foreground leading-snug">
                    {metric.subtext}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

        {!isLoading && paid > 0 && (
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-sm font-medium">Period equation</p>
            <p className="mt-1 text-muted-foreground text-xs sm:text-sm">
              <span className="tabular-nums">{formatCurrency(paid)}</span>{' '}
              collected −{' '}
              <span className="tabular-nums">{formatCurrency(expenses)}</span>{' '}
              expenses ={' '}
              <span className="tabular-nums font-medium text-foreground">
                {formatCurrency(netProfit)}
              </span>{' '}
              net profit
              {pending > 0 && (
                <>
                  {' · '}
                  <span className="tabular-nums">{formatCurrency(pending)}</span>{' '}
                  pending (excluded)
                </>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
