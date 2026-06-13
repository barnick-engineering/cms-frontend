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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import type { ExpenseReportV1Response } from '@/interface/reportV1Interface'
import { NoDataFound } from '@/components/NoDataFound'
import { buildReportHref } from '@/lib/reports/reportLinks'
import { ReportSlug } from '@/utils/enums/reportType'

const expenseChartConfig = {
  amount: {
    label: 'Amount',
    theme: { light: 'hsl(0, 0%, 0%)', dark: 'hsl(0, 0%, 100%)' },
  },
} satisfies ChartConfig

type DashboardExpenseSnapshotProps = {
  data?: ExpenseReportV1Response
  isLoading?: boolean
  reportFrom?: string
  reportTo?: string
}

function formatCurrency(value: number) {
  return `৳${value.toLocaleString('en-IN')}`
}

export function DashboardExpenseSnapshot({
  data,
  isLoading,
  reportFrom,
  reportTo,
}: DashboardExpenseSnapshotProps) {
  const chartData = useMemo(() => {
    const byPurpose = new Map<string, number>()
    for (const row of data?.data ?? []) {
      const key = row.purpose?.trim() || 'Other'
      byPurpose.set(key, (byPurpose.get(key) ?? 0) + row.amount)
    }
    return Array.from(byPurpose.entries())
      .map(([purpose, amount]) => ({
        purpose:
          purpose.length > 18 ? `${purpose.slice(0, 16)}…` : purpose,
        fullPurpose: purpose,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [data?.data])

  const summary = data?.summary

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base sm:text-lg">Expense snapshot</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {summary
              ? `${formatCurrency(summary.total_expenses)} across ${summary.count} expenses (top purposes from loaded rows)`
              : 'Top expense purposes for this period'}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 h-8" asChild>
          <Link
            to={buildReportHref(
              ReportSlug.EXPENSE_BY_PURPOSE,
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
          <div className="flex h-[220px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading expenses…</p>
          </div>
        ) : chartData.length === 0 ? (
          <NoDataFound
            message="No expenses"
            details="Expenses in this period will appear here."
          />
        ) : (
          <ChartContainer config={expenseChartConfig} className="h-[220px] w-full">
            <RechartsBarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 8, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `৳${(v / 1000).toFixed(0)}k` : `৳${v}`
                }
                tick={{ fontSize: 10 }}
              />
              <YAxis
                type="category"
                dataKey="purpose"
                tickLine={false}
                axisLine={false}
                width={88}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const item = payload?.[0]?.payload as
                        | { fullPurpose?: string }
                        | undefined
                      return item?.fullPurpose ?? ''
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Bar
                dataKey="amount"
                fill="var(--color-amount)"
                radius={[0, 4, 4, 0]}
                barSize={18}
              />
            </RechartsBarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
