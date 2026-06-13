import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import RecentWorkordersTable from '@/components/dashboard/RecentWorkordersTable'
import { DashboardPeriodSnapshot } from '@/components/dashboard/DashboardPeriodSnapshot'
import { DashboardMoneyFlow } from '@/components/dashboard/DashboardMoneyFlow'
import { DashboardTwelveMonthAnalytics } from '@/components/dashboard/DashboardTwelveMonthAnalytics'
import { DashboardCrossFunctionalInsights } from '@/components/dashboard/DashboardCrossFunctionalInsights'
import { DashboardPaymentCharts } from '@/components/dashboard/DashboardPaymentCharts'
import { DashboardTopCustomers } from '@/components/dashboard/DashboardTopCustomers'
import { DashboardExpenseSnapshot } from '@/components/dashboard/DashboardExpenseSnapshot'
import { useDashboardData } from '@/hooks/useDashboard'
import {
  useBalanceSheetReportV1,
  useCustomerWorkOrdersReport,
  useExpensesReportV1,
} from '@/hooks/useReportV1'
import DateRangeSearch from '@/components/DateRangeSearch'
import { format, subDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'

const getDefaultDateRange = (): DateRange => {
  const end = new Date()
  const start = subDays(end, 30)
  return { from: start, to: end }
}

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultDateRange)

  const dashboardApiParams = useMemo(() => {
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

  const reportHookParams = useMemo(() => {
    const from = dateRange?.from
    const to = dateRange?.to
    if (!from || !to) return undefined
    return {
      startDate: format(from, 'yyyy-MM-dd'),
      endDate: format(to, 'yyyy-MM-dd'),
    }
  }, [dateRange])

  const reportsEnabled = !!reportHookParams

  const {
    data: dashboardResponse,
    isLoading: dashboardLoading,
    isError: dashboardError,
    error: dashboardErr,
  } = useDashboardData(dashboardApiParams)

  const {
    data: twelveMonthResponse,
    isLoading: twelveMonthLoading,
  } = useDashboardData(undefined)

  const { data: balanceSheet, isLoading: balanceLoading } =
    useBalanceSheetReportV1(reportHookParams, { enabled: reportsEnabled })

  const { data: customerReport, isLoading: customersLoading } =
    useCustomerWorkOrdersReport(
      reportHookParams
        ? { ...reportHookParams, limit: 100, offset: 0 }
        : undefined,
      { enabled: reportsEnabled }
    )

  const { data: expenseReport, isLoading: expensesLoading } =
    useExpensesReportV1(
      reportHookParams
        ? { ...reportHookParams, limit: 100, offset: 0 }
        : undefined,
      { enabled: reportsEnabled }
    )

  const dashboardData = dashboardResponse?.data
  const twelveMonthData = twelveMonthResponse?.data
  const balance = balanceSheet?.data

  const paid = dashboardData?.paid ?? 0
  const pending = dashboardData?.total_pending ?? 0
  const worked = dashboardData?.worked ?? 0

  const expenses =
    balance?.expenses ?? dashboardData?.total_regular_expense ?? 0

  // Profit and margin use collected revenue only — pending is excluded
  const realizedNetProfit = paid - expenses
  const realizedMargin =
    paid > 0 ? (realizedNetProfit / paid) * 100 : undefined

  const snapshotLoading = dashboardLoading || balanceLoading
  const activeCustomers =
    customerReport?.summary?.total_customers ??
    customerReport?.data?.length ??
    0

  const handleDateChange = (from?: Date, to?: Date) => {
    if (from && to) {
      setDateRange({ from, to })
    } else {
      setDateRange(getDefaultDateRange())
    }
  }

  if (dashboardError) {
    return (
      <Main>
        <div className="flex flex-col items-center justify-center h-96 gap-2">
          <p className="text-destructive text-lg font-semibold">
            Error loading dashboard data.
          </p>
          {dashboardErr && (
            <p className="text-muted-foreground text-sm">
              {dashboardErr instanceof Error
                ? dashboardErr.message
                : 'Unknown error occurred'}
            </p>
          )}
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className="mb-4 sm:mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            How your print business is performing this period
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeSearch value={dateRange} onDateChange={handleDateChange} />
        </div>
      </div>

      <div className="space-y-6">
        <DashboardPeriodSnapshot
          worked={worked}
          paid={paid}
          pending={pending}
          expenses={expenses}
          netProfit={realizedNetProfit}
          marginPercent={realizedMargin}
          customers={dashboardData?.total_customer}
          workOrders={dashboardData?.total_workorder}
          products={dashboardData?.total_product}
          isLoading={snapshotLoading}
        />

        <DashboardMoneyFlow
          worked={worked}
          paid={paid}
          pending={pending}
          expenses={expenses}
          netProfit={realizedNetProfit}
          isLoading={snapshotLoading}
        />

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <DashboardTwelveMonthAnalytics
            monthlySales={twelveMonthData?.monthly_sales}
            isLoading={twelveMonthLoading && !twelveMonthData}
          />
          <DashboardCrossFunctionalInsights
            worked={worked}
            paid={paid}
            pending={pending}
            expenses={expenses}
            netProfit={realizedNetProfit}
            marginPercent={realizedMargin}
            activeCustomers={activeCustomers}
            expenseCount={expenseReport?.summary?.count}
            totalExpenseAmount={expenseReport?.summary?.total_expenses}
            isLoading={snapshotLoading || customersLoading || expensesLoading}
          />
        </div>

        <DashboardPaymentCharts
          paid={paid}
          pending={pending}
          income={paid}
          expenses={expenses}
          netProfit={realizedNetProfit}
          isLoading={snapshotLoading}
        />

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <DashboardTopCustomers
            data={customerReport}
            isLoading={customersLoading}
            reportFrom={reportHookParams?.startDate}
            reportTo={reportHookParams?.endDate}
          />
          <DashboardExpenseSnapshot
            data={expenseReport}
            isLoading={expensesLoading}
            reportFrom={reportHookParams?.startDate}
            reportTo={reportHookParams?.endDate}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Recent work orders
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Latest jobs — payment status at a glance
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <RecentWorkordersTable
              data={dashboardData}
              isLoading={dashboardLoading && !dashboardData}
            />
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}

export default Dashboard
