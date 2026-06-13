import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell } from 'recharts'
import { useCustomerWorkOrdersReport } from '@/hooks/useReportV1'
import { useDashboardData } from '@/hooks/useDashboard'
import { ReportCard } from '@/components/report/ReportCard'
import { sortCustomersByPending } from '@/lib/reports/sortCustomersByAmount'
import { formatReportCurrency } from '@/lib/reports/collectedProfit'
import Loader from '@/components/layout/Loader'
import { NoDataFound } from '@/components/NoDataFound'
import type { ReportV1HookParams } from '@/hooks/useReportV1'

const chartConfig = {
  collected: {
    label: 'Collected',
    theme: { light: 'hsl(0, 0%, 0%)', dark: 'hsl(0, 0%, 100%)' },
  },
  pending: {
    label: 'Pending',
    theme: { light: 'hsl(0, 0%, 55%)', dark: 'hsl(0, 0%, 65%)' },
  },
} satisfies ChartConfig

type CollectionsOutstandingReportProps = {
  reportParams?: ReportV1HookParams
  enabled: boolean
}

export function CollectionsOutstandingReport({
  reportParams,
  enabled,
}: CollectionsOutstandingReportProps) {
  const dashboardParams = useMemo(() => {
    if (!reportParams?.startDate || !reportParams?.endDate) return undefined
    return {
      start_date: reportParams.startDate,
      end_date: reportParams.endDate,
    }
  }, [reportParams])

  const { data: dashboardRes, isLoading: dashLoading } = useDashboardData(
    dashboardParams,
    { enabled }
  )
  const { data: customerReport, isLoading: customersLoading } =
    useCustomerWorkOrdersReport(
      reportParams ? { ...reportParams, limit: 100, offset: 0 } : undefined,
      { enabled }
    )

  const isLoading = dashLoading || customersLoading
  const summary = customerReport?.summary
  const paid = dashboardRes?.data?.paid ?? summary?.grand_total_paid ?? 0
  const pending =
    dashboardRes?.data?.total_pending ?? summary?.grand_total_pending ?? 0

  const followUpList = useMemo(
    () =>
      sortCustomersByPending(customerReport?.data ?? [])
        .filter((c) => c.pending > 0)
        .slice(0, 20),
    [customerReport?.data]
  )

  const pieData = [
    { name: 'Collected', value: paid, fill: 'var(--color-collected)' },
    { name: 'Pending', value: pending, fill: 'var(--color-pending)' },
  ].filter((d) => d.value > 0)

  if (isLoading) return <Loader />

  if (!summary && followUpList.length === 0) {
    return (
      <NoDataFound
        message="No collection data"
        details="Try a different date range."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <ReportCard label="Grand total amount" value={summary?.grand_total_amount ?? 0} />
        <ReportCard label="Collected" value={paid} />
        <ReportCard label="Outstanding" value={pending} />
        <ReportCard
          label="Collection rate"
          value={
            summary && summary.grand_total_amount > 0
              ? (summary.grand_total_paid / summary.grand_total_amount) * 100
              : 0
          }
          format="percent"
        />
      </div>

      {pieData.length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">Collected vs outstanding</h3>
          <ChartContainer config={chartConfig} className="mx-auto min-h-[220px] max-w-md">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatReportCurrency(Number(value))}
                  />
                }
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius="45%"
                outerRadius="75%"
                paddingAngle={2}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      )}

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Collection follow-up list</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customers with outstanding balance — sorted by pending amount
          </p>
        </div>
        {followUpList.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">All collected for this period.</p>
        ) : (
          <div className="divide-y">
            {followUpList.map((row) => (
              <div
                key={row.customer_id}
                className="grid grid-cols-1 sm:grid-cols-4 gap-2 px-4 py-3 text-sm items-center"
              >
                <Link
                  to={`/customers/${row.customer_id}`}
                  className="font-medium hover:underline text-primary truncate"
                >
                  {row.customer_name}
                </Link>
                <span className="text-muted-foreground sm:text-right tabular-nums">
                  {row.order_count} orders
                </span>
                <span className="sm:text-right tabular-nums">
                  {formatReportCurrency(row.total_amount)}
                </span>
                <span className="sm:text-right tabular-nums font-medium">
                  {formatReportCurrency(row.pending)} pending
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
