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
import { DollarSign, CreditCard, AlertCircle, TrendingUp } from 'lucide-react'

interface BusinessAnalyticsProps {
  data?: {
    worked?: number
    paid?: number
    total_pending?: number
    total_regular_expense?: number
    total_net_profit?: number
    total_customer?: number
    total_workorder?: number
  }
  isLoading?: boolean
}

// Chart configurations
const paymentChartConfig = {
  paid: {
    label: 'Paid',
    theme: {
      light: 'hsl(0, 0%, 0%)', // black
      dark: 'hsl(0, 0%, 100%)', // white
    },
  },
  pending: {
    label: 'Pending',
    theme: {
      light: 'hsl(0, 0%, 70%)', // light gray
      dark: 'hsl(0, 0%, 30%)', // dark gray
    },
  },
} satisfies ChartConfig

const financialChartConfig = {
  expenses: {
    label: 'Expenses',
    theme: {
      light: 'hsl(0, 0%, 0%)', // black
      dark: 'hsl(0, 0%, 100%)', // white
    },
  },
  netProfit: {
    label: 'Net Profit',
    theme: {
      light: 'hsl(0, 0%, 70%)', // light gray
      dark: 'hsl(0, 0%, 30%)', // dark gray
    },
  },
} satisfies ChartConfig

const businessChartConfig = {
  customers: {
    label: 'Customers',
    theme: {
      light: 'hsl(0, 0%, 0%)', // black
      dark: 'hsl(0, 0%, 100%)', // white
    },
  },
  workOrders: {
    label: 'Work Orders',
    theme: {
      light: 'hsl(0, 0%, 70%)', // light gray
      dark: 'hsl(0, 0%, 30%)', // dark gray
    },
  },
} satisfies ChartConfig

const BusinessAnalytics = ({ data, isLoading }: BusinessAnalyticsProps) => {
  // Get data from API or use defaults
  const totalWorkValue = data?.worked || 0
  const paidAmount = data?.paid || 0
  const pendingAmount = data?.total_pending || 0
  const expenses = data?.total_regular_expense || 0
  const netProfit = data?.total_net_profit || 0
  const customers = data?.total_customer || 0
  const workOrders = data?.total_workorder || 0

  // Prepare data for charts
  const paymentData = [
    { name: 'Paid', value: paidAmount, fill: 'var(--color-paid)' },
    { name: 'Pending', value: pendingAmount, fill: 'var(--color-pending)' },
  ]

  const financialData = [
    {
      name: 'Financial Overview',
      expenses: expenses,
      netProfit: netProfit,
    },
  ]

  const businessData = [
    {
      name: 'Business Metrics',
      customers: customers,
      workOrders: workOrders,
    },
  ]

  const formatCurrency = (value: number) => {
    return `৳${value.toLocaleString('en-IN')}`
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Work Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {isLoading ? '...' : formatCurrency(totalWorkValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total work order value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {isLoading ? '...' : formatCurrency(paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Amount received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {isLoading ? '...' : formatCurrency(pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Outstanding amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {isLoading ? '...' : formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">After expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Donut Chart - Paid vs Pending */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Payment Status</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Paid vs Pending amounts</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <ChartContainer config={paymentChartConfig} className="min-h-[250px] sm:min-h-[300px] w-full">
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
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Expenses vs Net Profit */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Financial Overview</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Expenses vs Net Profit</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <ChartContainer config={financialChartConfig} className="min-h-[250px] sm:min-h-[300px] w-full">
              <RechartsBarChart
                data={financialData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false}
                  hide={true}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    // Shorten currency format on mobile
                    if (value >= 1000) {
                      return `৳${(value / 1000).toFixed(1)}k`
                    }
                    return formatCurrency(value)
                  }}
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
                  dataKey="expenses"
                  fill="var(--color-expenses)"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
                <Bar
                  dataKey="netProfit"
                  fill="var(--color-netProfit)"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Customers vs Work Orders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Business Metrics</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Customers vs Work Orders</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <ChartContainer config={businessChartConfig} className="min-h-[250px] sm:min-h-[300px] w-full">
              <RechartsBarChart
                data={businessData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false}
                  hide={true}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  width={40}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Legend />
                <Bar
                  dataKey="customers"
                  fill="var(--color-customers)"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
                <Bar
                  dataKey="workOrders"
                  fill="var(--color-workOrders)"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BusinessAnalytics
