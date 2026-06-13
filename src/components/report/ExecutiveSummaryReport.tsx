import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDashboardData } from '@/hooks/useDashboard'
import {
  useBalanceSheetReportV1,
  useCustomerWorkOrdersReport,
  useExpensesReportV1,
  useTrendingReport,
} from '@/hooks/useReportV1'
import { DashboardMoneyFlow } from '@/components/dashboard/DashboardMoneyFlow'
import { TrendingReportChart } from '@/components/report/TrendingReportChart'
import { ReportCard } from '@/components/report/ReportCard'
import { sortCustomersByAmount } from '@/lib/reports/sortCustomersByAmount'
import { formatReportCurrency } from '@/lib/reports/collectedProfit'
import { getExpensePurposeGroup } from '@/lib/reports/expensePurposeGroups'
import Loader from '@/components/layout/Loader'
import { buildReportHref } from '@/lib/reports/reportLinks'
import { ReportSlug } from '@/utils/enums/reportType'
import type { ReportV1HookParams } from '@/hooks/useReportV1'

type ExecutiveSummaryReportProps = {
  reportParams?: ReportV1HookParams
  exportDateRange?: { from: string; to: string }
  enabled: boolean
}

export function ExecutiveSummaryReport({
  reportParams,
  exportDateRange,
  enabled,
}: ExecutiveSummaryReportProps) {
  const dashboardParams = useMemo(() => {
    if (!reportParams?.startDate || !reportParams?.endDate) return undefined
    return {
      start_date: reportParams.startDate,
      end_date: reportParams.endDate,
    }
  }, [reportParams])

  const { data: dashboardRes, isLoading: dashLoading } = useDashboardData(
    dashboardParams,
    { enabled }
  )
  const { data: balanceSheet, isLoading: balanceLoading } =
    useBalanceSheetReportV1(reportParams, { enabled })
  const { data: customerReport, isLoading: customersLoading } =
    useCustomerWorkOrdersReport(
      reportParams ? { ...reportParams, limit: 100, offset: 0 } : undefined,
      { enabled }
    )
  const { data: expenseReport, isLoading: expensesLoading } =
    useExpensesReportV1(
      reportParams ? { ...reportParams, limit: 100, offset: 0 } : undefined,
      { enabled }
    )
  const { data: trendingData, isLoading: trendingLoading } = useTrendingReport(
    reportParams,
    { enabled }
  )

  const isLoading =
    dashLoading || balanceLoading || customersLoading || expensesLoading || trendingLoading

  const dashboard = dashboardRes?.data
  const paid = dashboard?.paid ?? 0
  const pending = dashboard?.total_pending ?? 0
  const worked = dashboard?.worked ?? 0
  const expenses =
    balanceSheet?.data?.expenses ?? dashboard?.total_regular_expense ?? 0
  const realizedNetProfit = paid - expenses

  const topCustomers = useMemo(
    () => sortCustomersByAmount(customerReport?.data ?? []).slice(0, 5),
    [customerReport?.data]
  )

  const topPurposes = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of expenseReport?.data ?? []) {
      const key = row.purpose?.trim() || 'Other'
      map.set(key, (map.get(key) ?? 0) + row.amount)
    }
    return Array.from(map.entries())
      .map(([purpose, amount]) => ({ purpose, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [expenseReport?.data])

  if (isLoading) return <Loader />

  const from = exportDateRange?.from
  const to = exportDateRange?.to

  return (
    <div className="space-y-6">
      <DashboardMoneyFlow
        worked={worked}
        paid={paid}
        pending={pending}
        expenses={expenses}
        netProfit={realizedNetProfit}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <ReportCard label="Work orders" value={dashboard?.total_workorder ?? 0} format="number" />
        <ReportCard label="Customers" value={dashboard?.total_customer ?? 0} format="number" />
        <ReportCard label="Collected" value={paid} />
        <ReportCard label="Realized profit" value={realizedNetProfit} />
      </div>

      {trendingData?.data && trendingData.data.length > 0 && (
        <TrendingReportChart data={trendingData.data} />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold">Top customers</h3>
            {from && to && (
              <Link
                to={buildReportHref(ReportSlug.CUSTOMER_WISE_WORK_ORDER, from, to)}
                className="text-xs text-primary hover:underline"
              >
                View all
              </Link>
            )}
          </div>
          {topCustomers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No customer data.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {topCustomers.map((c) => (
                <li key={c.customer_id} className="flex justify-between gap-2">
                  <Link
                    to={`/customers/${c.customer_id}`}
                    className="font-medium hover:underline truncate"
                  >
                    {c.customer_name}
                  </Link>
                  <span className="tabular-nums shrink-0">
                    {formatReportCurrency(c.total_amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold">Top expense purposes</h3>
            {from && to && (
              <Link
                to={buildReportHref(ReportSlug.EXPENSE_BY_PURPOSE, from, to)}
                className="text-xs text-primary hover:underline"
              >
                View all
              </Link>
            )}
          </div>
          {topPurposes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expense data.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {topPurposes.map((p) => (
                <li key={p.purpose} className="flex justify-between gap-2">
                  <span className="truncate">
                    {p.purpose}
                    <span className="text-muted-foreground text-xs ml-1">
                      ({getExpensePurposeGroup(p.purpose)})
                    </span>
                  </span>
                  <span className="tabular-nums shrink-0">
                    {formatReportCurrency(p.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
