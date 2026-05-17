import {
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { NoDataFound } from "../NoDataFound"
import type { DashboardData } from "@/api/dashboardApi"

interface DashboardOverviewProps {
  data?: Pick<DashboardData, "monthly_sales">
  isLoading?: boolean
}

const chartConfig = {
  total_sell: {
    label: "Total Sell",
    theme: {
      light: "hsl(0 0% 0%)",
      dark: "hsl(0 0% 100%)",
    },
  },
  total_paid: {
    label: "Total Paid",
    theme: {
      light: "hsl(0 0% 55%)",
      dark: "hsl(0 0% 65%)",
    },
  },
} satisfies ChartConfig

const formatMonthLabel = (monthStr: string) => {
  const date = new Date(monthStr)
  if (Number.isNaN(date.getTime())) return monthStr
  const monthAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const twoDigitYear = date.getFullYear().toString().slice(-2)
  return `${monthAbbr[date.getMonth()]}'${twoDigitYear}`
}

const formatCurrency = (value: number) => `৳${value.toLocaleString("en-IN")}`

const DashboardOverview = ({ data, isLoading }: DashboardOverviewProps) => {
  const chartData =
    data?.monthly_sales?.map((entry) => ({
      name: formatMonthLabel(entry.month),
      total_sell: entry.total_sell ?? 0,
      total_paid: entry.total_paid ?? 0,
    })) ?? []

  const hasData = chartData.some(
    (item) => item.total_sell > 0 || item.total_paid > 0
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading chart...</p>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="rounded-xl border bg-card shadow-sm overflow-auto">
        <NoDataFound
          message="No Sales Data"
          details="Sales data will appear here once available."
        />
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] sm:min-h-64 w-full">
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
            return `৳${value.toLocaleString("en-IN")}`
          }}
          tick={{ fontSize: 10 }}
          width={50}
        />
        <ChartTooltip
          cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                const numValue = typeof value === "number" ? value : Number(value) || 0
                const label =
                  chartConfig[name as keyof typeof chartConfig]?.label ?? name
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
  )
}

export default DashboardOverview
