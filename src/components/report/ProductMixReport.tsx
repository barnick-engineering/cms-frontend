import { useMemo } from 'react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useWorkOrderDetailsReport } from '@/hooks/useReportV1'
import { formatReportCurrency } from '@/lib/reports/collectedProfit'
import Loader from '@/components/layout/Loader'
import { NoDataFound } from '@/components/NoDataFound'
import type { ReportV1HookParams } from '@/hooks/useReportV1'

const chartConfig = {
  revenue: {
    label: 'Revenue',
    theme: { light: 'hsl(0, 0%, 0%)', dark: 'hsl(0, 0%, 100%)' },
  },
} satisfies ChartConfig

type ProductMixReportProps = {
  reportParams?: ReportV1HookParams
  enabled: boolean
}

export function ProductMixReport({
  reportParams,
  enabled,
}: ProductMixReportProps) {
  const { data, isLoading } = useWorkOrderDetailsReport(
    reportParams ? { ...reportParams, limit: 100, offset: 0 } : undefined,
    { enabled }
  )

  const aggregated = useMemo(() => {
    const map = new Map<
      string,
      { item: string; quantity: number; revenue: number; orderCount: number }
    >()
    for (const row of data?.data ?? []) {
      for (const item of row.items ?? []) {
        const name = item.item?.trim() || 'Unknown'
        const qty = Number(item.total_order) || 0
        const revenue = qty * (Number(item.unit_price) || 0)
        const existing = map.get(name) ?? {
          item: name,
          quantity: 0,
          revenue: 0,
          orderCount: 0,
        }
        existing.quantity += qty
        existing.revenue += revenue
        existing.orderCount += 1
        map.set(name, existing)
      }
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
  }, [data?.data])

  const chartData = aggregated.slice(0, 10).map((r) => ({
    name: r.item.length > 14 ? `${r.item.slice(0, 12)}…` : r.item,
    revenue: r.revenue,
  }))

  if (isLoading) return <Loader />

  if (aggregated.length === 0) {
    return (
      <NoDataFound
        message="No item data"
        details="Work order line items will appear for this period."
      />
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Aggregated from work order line items (first {data?.data?.length ?? 0} jobs loaded).
      </p>

      {chartData.length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">Top items by revenue</h3>
          <ChartContainer config={chartConfig} className="min-h-[240px] w-full">
            <BarChart data={chartData} margin={{ left: 0, bottom: 40 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `৳${(v / 1000).toFixed(0)}k` : `৳${v}`
                }
                width={48}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatReportCurrency(Number(value))}
                  />
                }
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2 text-right">Line count</th>
              <th className="px-4 py-2 text-right">Quantity</th>
              <th className="px-4 py-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {aggregated.map((row) => (
              <tr key={row.item} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium">{row.item}</td>
                <td className="px-4 py-2 text-right tabular-nums">{row.orderCount}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {row.quantity.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-2 text-right tabular-nums font-medium">
                  {formatReportCurrency(row.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
