import {
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { NoDataFound } from "../NoDataFound"

interface DashboardOverviewProps {
  data?: {
    monthly_sales?: number[]
  }
  isLoading?: boolean
}

// chart configuration for ChartContainer
const chartConfig = {
  sales: {
    label: "Sales",
    theme: {
      light: "hsl(0 0% 0%)", // black for light mode
      dark: "hsl(0 0% 100%)", // white for dark mode
    },
  },
} satisfies ChartConfig

const DashboardOverview = ({ data, isLoading }: DashboardOverviewProps) => {
  // Generate last 12 months dynamically (going backwards from current month)
  const getLast12Months = () => {
    const months = []
    const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthIndex = date.getMonth()
      const year = date.getFullYear()
      const twoDigitYear = year.toString().slice(-2)
      months.push(`${monthAbbr[monthIndex]}'${twoDigitYear}`)
    }
    
    return months.reverse() // Reverse to show oldest to newest (left to right)
  }
  
  const monthLabels = getLast12Months()
  
  // Map monthly_sales array to chart data
  // monthly_sales is an array of 12 numbers representing last 12 months
  const chartData = data?.monthly_sales?.map((sales, index) => ({
    name: monthLabels[index] || `Month ${index + 1}`,
    sales: sales || 0,
  })) || []

  const hasData = chartData.some((item) => item.sales > 0)

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
            // Shorten currency format on mobile for large values
            if (value >= 1000) {
              return `৳${(value / 1000).toFixed(1)}k`
            }
            return `৳${value.toLocaleString('en-IN')}`
          }}
          tick={{ fontSize: 10 }}
          width={50}
        />
        <ChartTooltip 
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          content={<ChartTooltipContent
            formatter={(value) => {
              const numValue = typeof value === 'number' ? value : Number(value) || 0
              return `৳${numValue.toLocaleString('en-IN')}`
            }}
          />} 
        />
        <Bar
          dataKey="sales"
          fill="var(--color-sales)"
          radius={[4, 4, 0, 0]}
        />
      </RechartsBarChart>
    </ChartContainer>
  )
}

export default DashboardOverview