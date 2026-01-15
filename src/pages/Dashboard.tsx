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
import { useDashboardData } from '@/hooks/useDashboard'
import { TrendingUp, TrendingDown, Users, Package, FileText, DollarSign, CreditCard, AlertCircle } from 'lucide-react'

const Dashboard = () => {
  const { data, isLoading, isError, error } = useDashboardData()

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

  return (
    <Main>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your business performance</p>
      </div>

      <div className="space-y-6">
        {/* Financial Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Worked</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : `৳${(dashboardData?.worked ?? 0).toLocaleString('en-IN')}`}
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
                {isLoading ? '...' : `৳${(dashboardData?.paid ?? 0).toLocaleString('en-IN')}`}
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
                {isLoading ? '...' : `৳${(dashboardData?.total_pending ?? 0).toLocaleString('en-IN')}`}
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
                {isLoading ? '...' : `৳${(dashboardData?.total_net_profit ?? 0).toLocaleString('en-IN')}`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">After expenses</p>
            </CardContent>
          </Card>
        </div>

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
              <CardTitle>Monthly Sales</CardTitle>
              <CardDescription>Sales performance over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardOverview data={dashboardData} isLoading={isLoading} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Work Orders</CardTitle>
              <CardDescription>
                {dashboardData?.recent_workorders?.length ?? 0} recent work orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentWorkordersTable data={dashboardData} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Main>
  )
}

export default Dashboard