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

// Static data
const analyticsData = {
  totalWorkValue: 236500,
  paidAmount: 124200,
  pendingAmount: 112300,
  expenses: 119000,
  netProfit: 5200,
  customers: 16,
  workOrders: 5,
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

const BusinessAnalytics = () => {
  // Prepare data for charts
  const paymentData = [
    { name: 'Paid', value: analyticsData.paidAmount, fill: 'var(--color-paid)' },
    { name: 'Pending', value: analyticsData.pendingAmount, fill: 'var(--color-pending)' },
  ]

  const financialData = [
    {
      name: 'Financial Overview',
      expenses: analyticsData.expenses,
      netProfit: analyticsData.netProfit,
    },
  ]

  const businessData = [
    {
      name: 'Business Metrics',
      customers: analyticsData.customers,
      workOrders: analyticsData.workOrders,
    },
  ]

  const formatCurrency = (value: number) => {
    return `৳${value.toLocaleString('en-IN')}`
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Work Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData.totalWorkValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total work order value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData.paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Amount received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData.pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Outstanding amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">After expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Donut Chart - Paid vs Pending */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Paid vs Pending amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={paymentChartConfig} className="min-h-[300px] w-full">
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
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
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
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Expenses vs Net Profit</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={financialChartConfig} className="min-h-[300px] w-full">
              <RechartsBarChart
                data={financialData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
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
            <CardTitle>Business Metrics</CardTitle>
            <CardDescription>Customers vs Work Orders</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={businessChartConfig} className="min-h-[300px] w-full">
              <RechartsBarChart
                data={businessData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
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
