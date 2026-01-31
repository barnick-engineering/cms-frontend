import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import RecentWorkordersTable from '@/components/dashboard/RecentWorkordersTable'
import BusinessAnalytics from '@/components/dashboard/BusinessAnalytics'
import { useDashboardData } from '@/hooks/useDashboard'
import DateRangeSearch from '@/components/DateRangeSearch'
import { format, subDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { TrendingDown, Users, Package, FileText } from 'lucide-react'

const getDefaultDateRange = (): DateRange => {
  const end = new Date()
  const start = subDays(end, 30)
  return { from: start, to: end }
}

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultDateRange)

  const dashboardParams = useMemo(() => {
    const from = dateRange?.from
    const to = dateRange?.to
    if (from && to) {
      return {
        start_date: format(from, 'yyyy-MM-dd'),
        end_date: format(to, 'yyyy-MM-dd'),
      }
    }
    return undefined
  }, [dateRange])

  const { data, isLoading, isError, error } = useDashboardData(dashboardParams)

  if (isError) {
    return (
      <Main>
        <div className="flex flex-col items-center justify-center h-96 gap-2">
          <p className="text-destructive text-lg font-semibold">Error loading dashboard data.</p>
          {error && (
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          )}
        </div>
      </Main>
    )
  }

  if (isLoading && !data) {
    return (
      <Main>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </Main>
    )
  }

  const dashboardData = data?.data

  const handleDateChange = (from?: Date, to?: Date) => {
    if (from && to) {
      setDateRange({ from, to })
    } else {
      setDateRange(getDefaultDateRange())
    }
  }

  return (
    <Main>
      <div className="mb-4 sm:mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Overview of your business performance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Date range:</span>
          <DateRangeSearch value={dateRange} onDateChange={handleDateChange} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Business Analytics Dashboard */}
        <BusinessAnalytics data={dashboardData} isLoading={isLoading} />

        {/* Statistics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : dashboardData?.total_customer ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : dashboardData?.total_product ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : dashboardData?.total_workorder ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : `৳${(dashboardData?.total_regular_expense ?? 0).toLocaleString('en-IN')}`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Workorders */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Monthly Sales</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Sales performance over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <DashboardOverview data={dashboardData} isLoading={isLoading} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Recent Work Orders</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {dashboardData?.recent_workorders?.length ?? 0} recent work orders
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <RecentWorkordersTable data={dashboardData} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Main>
  )
}

export default Dashboard