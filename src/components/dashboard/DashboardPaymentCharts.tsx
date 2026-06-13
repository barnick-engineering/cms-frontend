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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'

const paymentChartConfig = {
  paid: {
    label: 'Collected',
    theme: { light: 'hsl(0, 0%, 0%)', dark: 'hsl(0, 0%, 100%)' },
  },
  pending: {
    label: 'Pending',
    theme: { light: 'hsl(0, 0%, 70%)', dark: 'hsl(0, 0%, 30%)' },
  },
} satisfies ChartConfig

const profitChartConfig = {
  income: {
    label: 'Collected',
    theme: { light: 'hsl(0, 0%, 0%)', dark: 'hsl(0, 0%, 100%)' },
  },
  expenses: {
    label: 'Expenses',
    theme: { light: 'hsl(0, 0%, 40%)', dark: 'hsl(0, 0%, 60%)' },
  },
  netProfit: {
    label: 'Net profit',
    theme: { light: 'hsl(0, 0%, 70%)', dark: 'hsl(0, 0%, 30%)' },
  },
} satisfies ChartConfig

function formatCurrency(value: number) {
  return `৳${value.toLocaleString('en-IN')}`
}

type DashboardPaymentChartsProps = {
  paid?: number
  pending?: number
  income?: number
  expenses?: number
  netProfit?: number
  isLoading?: boolean
}

export function DashboardPaymentCharts({
  paid = 0,
  pending = 0,
  income = 0,
  expenses = 0,
  netProfit = 0,
  isLoading,
}: DashboardPaymentChartsProps) {
  const paymentData = [
    { name: 'Collected', value: paid, fill: 'var(--color-paid)' },
    { name: 'Pending', value: pending, fill: 'var(--color-pending)' },
  ].filter((d) => d.value > 0)

  const profitData = [
    {
      name: 'Period',
      income,
      expenses,
      netProfit,
    },
  ]

  const hasPaymentData = paid > 0 || pending > 0
  const hasProfitData = income > 0 || expenses > 0 || netProfit !== 0

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Collections</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Collected vs outstanding for the period
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-[250px] items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
          ) : !hasPaymentData ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No collection data for this period.
            </div>
          ) : (
            <ChartContainer
              config={paymentChartConfig}
              className="min-h-[250px] w-full"
            >
              <RechartsPieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="70%"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                  labelLine={false}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Profit breakdown</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Collected revenue, expenses, and net profit (pending excluded)
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-[250px] items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
          ) : !hasProfitData ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No profit data for this period.
            </div>
          ) : (
            <ChartContainer
              config={profitChartConfig}
              className="min-h-[250px] w-full"
            >
              <RechartsBarChart
                data={profitData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value >= 1000
                      ? `৳${(value / 1000).toFixed(1)}k`
                      : formatCurrency(value)
                  }
                  tick={{ fontSize: 10 }}
                  width={50}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Legend />
                <Bar
                  dataKey="income"
                  fill="var(--color-income)"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
                <Bar
                  dataKey="expenses"
                  fill="var(--color-expenses)"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
                <Bar
                  dataKey="netProfit"
                  fill="var(--color-netProfit)"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
              </RechartsBarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
