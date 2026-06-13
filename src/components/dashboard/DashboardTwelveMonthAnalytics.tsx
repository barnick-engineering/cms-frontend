import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  Legend,
} from 'recharts'
import type { MonthlySalesEntry } from '@/api/dashboardApi'
import { NoDataFound } from '@/components/NoDataFound'

const chartConfig = {
  total_sell: {
    label: 'Total Sell',
    theme: { light: 'hsl(0 0% 0%)', dark: 'hsl(0 0% 100%)' },
  },
  total_paid: {
    label: 'Total Paid',
    theme: { light: 'hsl(0 0% 55%)', dark: 'hsl(0 0% 65%)' },
  },
} satisfies ChartConfig

function formatMonthLabel(monthStr: string) {
  const date = new Date(monthStr)
  if (Number.isNaN(date.getTime())) return monthStr
  const monthAbbr = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  return `${monthAbbr[date.getMonth()]}'${date.getFullYear().toString().slice(-2)}`
}

function formatCurrency(value: number) {
  return `৳${value.toLocaleString('en-IN')}`
}

type DashboardTwelveMonthAnalyticsProps = {
  monthlySales?: MonthlySalesEntry[]
  isLoading?: boolean
}

export function DashboardTwelveMonthAnalytics({
  monthlySales = [],
  isLoading,
}: DashboardTwelveMonthAnalyticsProps) {
  const chartData = useMemo(
    () =>
      monthlySales.map((entry) => ({
        name: formatMonthLabel(entry.month),
        total_sell: entry.total_sell ?? 0,
        total_paid: entry.total_paid ?? 0,
      })),
    [monthlySales]
  )

  const hasData = chartData.some(
    (item) => item.total_sell > 0 || item.total_paid > 0
  )

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Monthly Sales</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Total sell vs total paid over the last 12 months
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <div className="flex h-[280px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading chart…</p>
          </div>
        ) : !hasData ? (
          <NoDataFound
            message="No Sales Data"
            details="Sales data will appear here once available."
          />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="min-h-[220px] sm:min-h-[280px] w-full"
          >
            <RechartsBarChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={5}
                axisLine={false}
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `৳${(value / 1000).toFixed(1)}k`
                  }
                  return formatCurrency(value)
                }}
                tick={{ fontSize: 10 }}
                width={50}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      const numValue =
                        typeof value === 'number' ? value : Number(value) || 0
                      const label =
                        chartConfig[name as keyof typeof chartConfig]?.label ??
                        name
                      return (
                        <span className="font-medium">
                          {label}: {formatCurrency(numValue)}
                        </span>
                      )
                    }}
                  />
                }
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="total_sell"
                name="Total Sell"
                fill="var(--color-total_sell)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="total_paid"
                name="Total Paid"
                fill="var(--color-total_paid)"
                radius={[4, 4, 0, 0]}
              />
            </RechartsBarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
