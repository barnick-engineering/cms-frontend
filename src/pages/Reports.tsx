import { useEffect, useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Main } from '@/components/layout/main'
import { ReportsLayout } from '@/components/report/ReportsLayout'
import { ReportsHub } from '@/components/report/ReportsHub'
import { ReportDetailView } from '@/components/report/ReportDetailView'
import { useReportDateRange } from '@/hooks/useReportDateRange'
import { useDashboardData } from '@/hooks/useDashboard'
import { useBalanceSheetReportV1 } from '@/hooks/useReportV1'
import { getReportBySlug } from '@/utils/enums/reportType'

const Reports = () => {
  const { slug } = useParams<{ slug?: string }>()
  const [pageIndex, setPageIndex] = useState(0)

  const {
    dateRange,
    preset,
    applyPreset,
    handleDateChange,
    reportHookParams,
    exportDateRange,
    reportsEnabled,
  } = useReportDateRange()

  const reportDef = getReportBySlug(slug)
  const mode = slug && reportDef ? 'detail' : 'hub'

  useEffect(() => {
    setPageIndex(0)
  }, [slug, reportHookParams?.startDate, reportHookParams?.endDate])

  const dashboardApiParams = useMemo(() => {
    if (!reportHookParams?.startDate || !reportHookParams?.endDate) return undefined
    return {
      start_date: reportHookParams.startDate,
      end_date: reportHookParams.endDate,
    }
  }, [reportHookParams])

  const { data: dashboardRes, isLoading: dashLoading } = useDashboardData(
    dashboardApiParams,
    { enabled: reportsEnabled }
  )
  const { data: balanceSheet, isLoading: balanceLoading } =
    useBalanceSheetReportV1(reportHookParams, { enabled: reportsEnabled })

  const dashboard = dashboardRes?.data
  const paid = dashboard?.paid ?? 0
  const pending = dashboard?.total_pending ?? 0
  const worked = dashboard?.worked ?? 0
  const expenses =
    balanceSheet?.data?.expenses ?? dashboard?.total_regular_expense ?? 0

  if (slug && !reportDef) {
    return <Navigate to="/reports" replace />
  }

  return (
    <Main>
      <ReportsLayout
        mode={mode}
        reportName={reportDef?.name}
        currentSlug={reportDef?.slug}
        dateRange={dateRange}
        preset={preset}
        onPresetChange={applyPreset}
        onDateChange={handleDateChange}
        executiveStrip={
          reportsEnabled
            ? {
                worked,
                paid,
                pending,
                expenses,
                isLoading: dashLoading || balanceLoading,
              }
            : undefined
        }
      >
        {mode === 'hub' ? (
          <ReportsHub />
        ) : reportDef ? (
          <ReportDetailView
            slug={reportDef.slug}
            reportParams={reportHookParams}
            exportDateRange={exportDateRange}
            enabled={reportsEnabled}
            pageIndex={pageIndex}
            onPageChange={setPageIndex}
          />
        ) : null}
      </ReportsLayout>
    </Main>
  )
}

export default Reports
