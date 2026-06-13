import { useMemo } from 'react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useExpensesReportV1 } from '@/hooks/useReportV1'
import { ReportCard } from '@/components/report/ReportCard'
import { getExpensePurposeGroup } from '@/lib/reports/expensePurposeGroups'
import { formatReportCurrency } from '@/lib/reports/collectedProfit'
import Loader from '@/components/layout/Loader'
import { NoDataFound } from '@/components/NoDataFound'
import type { ReportV1HookParams } from '@/hooks/useReportV1'

const chartConfig = {
  amount: {
    label: 'Amount',
    theme: { light: 'hsl(0, 0%, 0%)', dark: 'hsl(0, 0%, 100%)' },
  },
} satisfies ChartConfig

type ExpenseByPurposeReportProps = {
  reportParams?: ReportV1HookParams
  enabled: boolean
}

export function ExpenseByPurposeReport({
  reportParams,
  enabled,
}: ExpenseByPurposeReportProps) {
  const { data, isLoading } = useExpensesReportV1(
    reportParams ? { ...reportParams, limit: 100, offset: 0 } : undefined,
    { enabled }
  )

  const aggregated = useMemo(() => {
    const map = new Map<
      string,
      { purpose: string; count: number; amount: number; linkedWo: number }
    >()
    for (const row of data?.data ?? []) {
      const purpose = row.purpose?.trim() || 'Other'
      const existing = map.get(purpose) ?? {
        purpose,
        count: 0,
        amount: 0,
        linkedWo: 0,
      }
      existing.count += 1
      existing.amount += row.amount
      if (row.work_order_id) existing.linkedWo += 1
      map.set(purpose, existing)
    }
    const total = Array.from(map.values()).reduce((s, r) => s + r.amount, 0)
    return Array.from(map.values())
      .map((r) => ({
        ...r,
        sharePercent: total > 0 ? (r.amount / total) * 100 : 0,
        group: getExpensePurposeGroup(r.purpose),
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [data?.data])

  const groupTotals = useMemo(() => {
    let production = 0
    let overhead = 0
    for (const row of aggregated) {
      if (row.group === 'production') production += row.amount
      else overhead += row.amount
    }
    return { production, overhead }
  }, [aggregated])

  const chartData = aggregated.slice(0, 10).map((r) => ({
    name: r.purpose.length > 14 ? `${r.purpose.slice(0, 12)}…` : r.purpose,
    amount: r.amount,
  }))

  if (isLoading) return <Loader />

  if (aggregated.length === 0) {
    return (
      <NoDataFound message="No expenses" details="Try a different date range." />
    )
  }

  const summary = data?.summary

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <ReportCard label="Total expenses" value={summary?.total_expenses ?? 0} />
        <ReportCard label="Expense count" value={summary?.count ?? 0} format="number" />
        <ReportCard label="Production spend" value={groupTotals.production} />
        <ReportCard label="Overhead spend" value={groupTotals.overhead} />
      </div>

      {chartData.length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">Top purposes</h3>
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
              <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2">Purpose</th>
              <th className="px-4 py-2">Group</th>
              <th className="px-4 py-2 text-right">Count</th>
              <th className="px-4 py-2 text-right">Linked WO</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {aggregated.map((row) => (
              <tr key={row.purpose} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium">{row.purpose}</td>
                <td className="px-4 py-2 text-muted-foreground capitalize">{row.group}</td>
                <td className="px-4 py-2 text-right tabular-nums">{row.count}</td>
                <td className="px-4 py-2 text-right tabular-nums">{row.linkedWo}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {formatReportCurrency(row.amount)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {row.sharePercent.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
