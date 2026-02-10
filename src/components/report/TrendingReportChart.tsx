import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import type { TrendingReportRow } from '@/interface/reportV1Interface'

// Black and gray tones for bars
const trendingChartConfig = {
  revenue: {
    label: 'Revenue',
    theme: { light: 'hsl(0, 0%, 0%)', dark: 'hsl(0, 0%, 100%)' },
  },
  expenses: {
    label: 'Expenses',
    theme: { light: 'hsl(0, 0%, 40%)', dark: 'hsl(0, 0%, 60%)' },
  },
  net_profit: {
    label: 'Net Profit',
    theme: { light: 'hsl(0, 0%, 70%)', dark: 'hsl(0, 0%, 30%)' },
  },
} satisfies ChartConfig

const formatCurrency = (value: number) => `৳${value.toLocaleString('en-IN')}`

interface TrendingReportChartProps {
  data: TrendingReportRow[]
}

export function TrendingReportChart({ data }: TrendingReportChartProps) {
  if (!data?.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Trending Overview</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Revenue, expenses and net profit by period
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <ChartContainer config={trendingChartConfig} className="h-[220px] max-w-2xl w-full">
          <RechartsBarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value >= 1000 ? `৳${(value / 1000).toFixed(0)}k` : `৳${value}`
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => `Period: ${label}`}
                />
              }
            />
            <Legend />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="net_profit" fill="var(--color-net_profit)" radius={[2, 2, 0, 0]} />
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
