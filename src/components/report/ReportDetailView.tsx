import { useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { ReportSlug } from '@/utils/enums/reportType'
import { ReportCard } from '@/components/report/ReportCard'
import { ReportTable } from '@/components/report/ReportTable'
import { WorkOrderDetailsReportTable } from '@/components/report/WorkOrderDetailsReportTable'
import { TrendingReportChart } from '@/components/report/TrendingReportChart'
import { ExecutiveSummaryReport } from '@/components/report/ExecutiveSummaryReport'
import { CollectionsOutstandingReport } from '@/components/report/CollectionsOutstandingReport'
import { ExpenseByPurposeReport } from '@/components/report/ExpenseByPurposeReport'
import { ProductMixReport } from '@/components/report/ProductMixReport'
import { LoanSummaryReport } from '@/components/report/LoanSummaryReport'
import { StockReportView } from '@/components/report/StockReportView'
import { NoDataFound } from '@/components/NoDataFound'
import Loader from '@/components/layout/Loader'
import { useLoanList } from '@/hooks/useLoan'
import { useStocksReport } from '@/hooks/useReport'
import { useShopStore } from '@/stores/shopStore'
import type { StockReportItem } from '@/interface/reportInterface'
import { generateStockReportPDF } from '@/utils/enums/stockReportPdf'
import { generateStockReportExcel } from '@/utils/enums/stockReportExcel'
import {
  useCustomerWorkOrdersReport,
  useBalanceSheetReportV1,
  useWorkOrderDetailsReport,
  useExpensesReportV1,
  useTrendingReport,
  type ReportV1HookParams,
} from '@/hooks/useReportV1'
import { useDashboardData } from '@/hooks/useDashboard'
import {
  CustomerWorkOrderReportColumns,
  ExpenseReportV1Columns,
  TrendingReportColumns,
} from '@/components/report/reportV1Columns'
import { sortCustomersByAmount } from '@/lib/reports/sortCustomersByAmount'
import {
  computeMarginOnCollected,
  computeRealizedProfit,
} from '@/lib/reports/collectedProfit'
import {
  generateCustomerWorkOrdersPdf,
  generateBalanceSheetPdf,
  generateWorkOrderDetailsPdf,
  generateExpenseReportV1Pdf,
  generateTrendingPdf,
  generateCollectionsOutstandingPdf,
  generateExpenseByPurposePdf,
  generateProductMixPdf,
  generateExecutiveSummaryPdf,
  generateLoanSummaryPdf,
  type ExecutiveSummaryExportData,
} from '@/utils/enums/reportsV1Pdf'
import {
  generateCustomerWorkOrdersExcel,
  generateBalanceSheetExcel,
  generateWorkOrderDetailsExcel,
  generateExpenseReportV1Excel,
  generateTrendingExcel,
  generateCollectionsOutstandingExcel,
  generateExpenseByPurposeExcel,
  generateProductMixExcel,
  generateExecutiveSummaryExcel,
  generateLoanSummaryExcel,
} from '@/utils/enums/reportsV1Excel'

const PAGE_SIZE = 10

type ReportDetailViewProps = {
  slug: ReportSlug
  reportParams?: ReportV1HookParams
  exportDateRange?: { from: string; to: string }
  enabled: boolean
  pageIndex: number
  onPageChange: (index: number) => void
}

export function ReportDetailView({
  slug,
  reportParams,
  exportDateRange,
  enabled,
  pageIndex,
  onPageChange,
}: ReportDetailViewProps) {
  const paginatedParams = useMemo(
    () =>
      reportParams
        ? { ...reportParams, limit: PAGE_SIZE, offset: pageIndex * PAGE_SIZE }
        : undefined,
    [reportParams, pageIndex]
  )

  const isCustomerWise = slug === ReportSlug.CUSTOMER_WISE_WORK_ORDER
  const isCollections = slug === ReportSlug.COLLECTIONS_OUTSTANDING
  const isBalanceSheet = slug === ReportSlug.BALANCE_SHEET
  const isWorkOrderDetails =
    slug === ReportSlug.WORK_ORDER_PROFITABILITY
  const isExpenseReport = slug === ReportSlug.EXPENSE_REPORT
  const isExpenseByPurpose = slug === ReportSlug.EXPENSE_BY_PURPOSE
  const isProductMix = slug === ReportSlug.PRODUCT_MIX
  const isTrending = slug === ReportSlug.TRENDING
  const isExecutive = slug === ReportSlug.EXECUTIVE_SUMMARY
  const isLoan = slug === ReportSlug.LOAN_SUMMARY
  const isStock = slug === ReportSlug.STOCK_REPORT

  const shopId = useShopStore((s) => s.currentShopId)
  const shopName = useShopStore((s) => s.currentShopName) ?? 'Shop'

  const needsCustomerBulk =
    isCustomerWise || isCollections

  const { data: customerData } =
    useCustomerWorkOrdersReport(
      reportParams ? { ...reportParams, limit: 100, offset: 0 } : undefined,
      { enabled: enabled && needsCustomerBulk && !isCustomerWise }
    )
  const { data: customerPagedData, isLoading: customerPagedLoading } =
    useCustomerWorkOrdersReport(paginatedParams, {
      enabled: enabled && isCustomerWise,
    })
  const { data: balanceSheetData, isLoading: balanceLoading } =
    useBalanceSheetReportV1(reportParams, {
      enabled: enabled && (isBalanceSheet || isExecutive),
    })
  const { data: woDetailsData, isLoading: woLoading } =
    useWorkOrderDetailsReport(
      isProductMix && reportParams
        ? { ...reportParams, limit: 100, offset: 0 }
        : paginatedParams,
      {
        enabled:
          enabled &&
          (isWorkOrderDetails || isProductMix),
      }
    )
  const { data: expensesData, isLoading: expensesLoading } =
    useExpensesReportV1(
      isExpenseByPurpose && reportParams
        ? { ...reportParams, limit: 100, offset: 0 }
        : paginatedParams,
      {
        enabled: enabled && (isExpenseReport || isExpenseByPurpose),
      }
    )
  const { data: trendingData, isLoading: trendingLoading } = useTrendingReport(
    reportParams,
    { enabled: enabled && (isTrending || isExecutive) }
  )

  const { data: executiveExpenseData } = useExpensesReportV1(
    reportParams ? { ...reportParams, limit: 100, offset: 0 } : undefined,
    { enabled: enabled && isExecutive }
  )

  const { data: executiveCustomerData } = useCustomerWorkOrdersReport(
    reportParams ? { ...reportParams, limit: 100, offset: 0 } : undefined,
    { enabled: enabled && isExecutive }
  )

  const { data: loanData } = useLoanList(
    undefined,
    reportParams?.startDate,
    reportParams?.endDate,
    undefined,
    100,
    0,
    { enabled: enabled && isLoan }
  )

  const { data: stockReportData } = useStocksReport(
    {
      page: 1,
      limit: 100,
      shopId: shopId ?? '',
      startDate: reportParams?.startDate ?? '',
      endDate: reportParams?.endDate ?? '',
      ids: [],
    },
    { enabled: enabled && isStock && !!shopId && !!reportParams }
  )

  const dashboardParams = useMemo(() => {
    if (!reportParams?.startDate || !reportParams?.endDate) return undefined
    return {
      start_date: reportParams.startDate,
      end_date: reportParams.endDate,
    }
  }, [reportParams])

  const { data: dashboardRes } = useDashboardData(dashboardParams, {
    enabled: enabled && (isBalanceSheet || isCollections || isExecutive),
  })

  const customerList = useMemo(
    () => sortCustomersByAmount(customerPagedData?.data ?? []),
    [customerPagedData?.data]
  )
  const customerSummary =
    customerPagedData?.summary ?? customerData?.summary
  const woList = woDetailsData?.data ?? []
  const expensesList = expensesData?.data ?? []
  const expensesSummary = expensesData?.summary
  const trendingList = trendingData?.data ?? []
  const trendingSummary = trendingData?.summary

  const collected =
    dashboardRes?.data?.paid ?? customerSummary?.grand_total_paid ?? 0
  const expenses =
    balanceSheetData?.data?.expenses ??
    dashboardRes?.data?.total_regular_expense ??
    0
  const realizedProfit = computeRealizedProfit(collected, expenses)
  const realizedMargin = computeMarginOnCollected(collected, realizedProfit)

  const executiveExportData = useMemo((): ExecutiveSummaryExportData | null => {
    if (!isExecutive || !dashboardRes?.data) return null
    const d = dashboardRes.data
    const paidVal = d.paid ?? 0
    const expensesVal =
      balanceSheetData?.data?.expenses ?? d.total_regular_expense ?? 0
    const purposeMap = new Map<string, number>()
    for (const row of executiveExpenseData?.data ?? []) {
      const key = row.purpose?.trim() || 'Other'
      purposeMap.set(key, (purposeMap.get(key) ?? 0) + row.amount)
    }
    const topPurposes = Array.from(purposeMap.entries())
      .map(([purpose, amount]) => ({ purpose, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
    const topCustomers = sortCustomersByAmount(executiveCustomerData?.data ?? [])
      .slice(0, 10)
      .map((c) => ({ name: c.customer_name, amount: c.total_amount }))
    return {
      worked: d.worked ?? 0,
      paid: paidVal,
      pending: d.total_pending ?? 0,
      expenses: expensesVal,
      netProfit: paidVal - expensesVal,
      workOrders: d.total_workorder,
      customers: d.total_customer,
      topCustomers,
      topPurposes,
    }
  }, [
    isExecutive,
    dashboardRes?.data,
    balanceSheetData?.data?.expenses,
    executiveExpenseData?.data,
    executiveCustomerData?.data,
  ])

  const stockItems: StockReportItem[] = useMemo(() => {
    const data = stockReportData
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.stocks)) return data.stocks
    return []
  }, [stockReportData])

  const handlePdf = useCallback(() => {
    if (!exportDateRange) return
    if (isCustomerWise && customerSummary) {
      generateCustomerWorkOrdersPdf(customerList, customerSummary, exportDateRange)
    } else if (isBalanceSheet && balanceSheetData) {
      generateBalanceSheetPdf(
        balanceSheetData,
        exportDateRange,
        collected,
        realizedProfit,
        realizedMargin
      )
    } else if (isWorkOrderDetails && woList.length > 0) {
      generateWorkOrderDetailsPdf(woList, exportDateRange)
    } else if (isExpenseReport && expensesSummary) {
      generateExpenseReportV1Pdf(expensesList, expensesSummary, exportDateRange)
    } else if (isTrending && trendingSummary) {
      generateTrendingPdf(trendingList, trendingSummary, exportDateRange)
    } else if (slug === ReportSlug.COLLECTIONS_OUTSTANDING && customerSummary) {
      generateCollectionsOutstandingPdf(
        sortCustomersByAmount(customerData?.data ?? []).filter((c) => c.pending > 0),
        customerSummary,
        exportDateRange,
        collected,
        dashboardRes?.data?.total_pending ?? customerSummary.grand_total_pending
      )
    } else if (slug === ReportSlug.EXPENSE_BY_PURPOSE && expensesData?.data) {
      generateExpenseByPurposePdf(expensesData.data, exportDateRange)
    } else if (slug === ReportSlug.PRODUCT_MIX && woDetailsData?.data) {
      generateProductMixPdf(woDetailsData.data, exportDateRange)
    } else if (isExecutive && executiveExportData) {
      generateExecutiveSummaryPdf(executiveExportData, exportDateRange)
    } else if (isLoan && loanData?.data?.length) {
      generateLoanSummaryPdf(
        loanData.data,
        loanData.summary,
        exportDateRange
      )
    } else if (isStock && stockItems.length > 0) {
      generateStockReportPDF(stockItems, shopName, exportDateRange)
    }
  }, [
    exportDateRange,
    isCustomerWise,
    customerSummary,
    customerList,
    isBalanceSheet,
    balanceSheetData,
    collected,
    realizedProfit,
    realizedMargin,
    isWorkOrderDetails,
    woList,
    isExpenseReport,
    expensesSummary,
    expensesList,
    isTrending,
    trendingSummary,
    trendingList,
    slug,
    customerData?.data,
    dashboardRes?.data?.total_pending,
    expensesData?.data,
    woDetailsData?.data,
    isExecutive,
    executiveExportData,
    isLoan,
    loanData,
    isStock,
    stockItems,
    shopName,
  ])

  const handleExcel = useCallback(() => {
    if (!exportDateRange) return
    if (isCustomerWise && customerSummary) {
      generateCustomerWorkOrdersExcel(customerList, customerSummary, exportDateRange)
    } else if (isBalanceSheet && balanceSheetData) {
      generateBalanceSheetExcel(
        balanceSheetData,
        exportDateRange,
        collected,
        realizedProfit,
        realizedMargin
      )
    } else if (isWorkOrderDetails && woList.length > 0) {
      generateWorkOrderDetailsExcel(woList, exportDateRange)
    } else if (isExpenseReport && expensesSummary) {
      generateExpenseReportV1Excel(expensesList, expensesSummary, exportDateRange)
    } else if (isTrending && trendingSummary) {
      generateTrendingExcel(trendingList, trendingSummary, exportDateRange)
    } else if (slug === ReportSlug.COLLECTIONS_OUTSTANDING && customerSummary) {
      generateCollectionsOutstandingExcel(
        sortCustomersByAmount(customerData?.data ?? []).filter((c) => c.pending > 0),
        customerSummary,
        exportDateRange
      )
    } else if (slug === ReportSlug.EXPENSE_BY_PURPOSE && expensesData?.data) {
      generateExpenseByPurposeExcel(expensesData.data, exportDateRange)
    } else if (slug === ReportSlug.PRODUCT_MIX && woDetailsData?.data) {
      generateProductMixExcel(woDetailsData.data, exportDateRange)
    } else if (isExecutive && executiveExportData) {
      generateExecutiveSummaryExcel(executiveExportData, exportDateRange)
    } else if (isLoan && loanData?.data?.length) {
      generateLoanSummaryExcel(
        loanData.data,
        loanData.summary,
        exportDateRange
      )
    } else if (isStock && stockItems.length > 0) {
      generateStockReportExcel(stockItems, shopName, exportDateRange)
    }
  }, [
    exportDateRange,
    isCustomerWise,
    customerSummary,
    customerList,
    isBalanceSheet,
    balanceSheetData,
    collected,
    realizedProfit,
    realizedMargin,
    isWorkOrderDetails,
    woList,
    isExpenseReport,
    expensesSummary,
    expensesList,
    isTrending,
    trendingSummary,
    trendingList,
    slug,
    customerData?.data,
    expensesData?.data,
    woDetailsData?.data,
    isExecutive,
    executiveExportData,
    isLoan,
    loanData,
    isStock,
    stockItems,
    shopName,
  ])

  const exportButtons = (
    <div className="flex flex-wrap gap-2 justify-end">
      <Button variant="outline" size="sm" onClick={handleExcel} className="gap-2">
        <Download className="h-4 w-4" />
        Excel
      </Button>
      <Button variant="outline" size="sm" onClick={handlePdf} className="gap-2">
        <Download className="h-4 w-4" />
        PDF
      </Button>
    </div>
  )

  if (slug === ReportSlug.EXECUTIVE_SUMMARY) {
    return (
      <div className="space-y-4">
        {exportButtons}
        <ExecutiveSummaryReport
          reportParams={reportParams}
          exportDateRange={exportDateRange}
          enabled={enabled}
        />
      </div>
    )
  }

  if (slug === ReportSlug.COLLECTIONS_OUTSTANDING) {
    return (
      <div className="space-y-4">
        {exportButtons}
        <CollectionsOutstandingReport reportParams={reportParams} enabled={enabled} />
      </div>
    )
  }

  if (slug === ReportSlug.EXPENSE_BY_PURPOSE) {
    return (
      <div className="space-y-4">
        {exportButtons}
        <ExpenseByPurposeReport reportParams={reportParams} enabled={enabled} />
      </div>
    )
  }

  if (slug === ReportSlug.PRODUCT_MIX) {
    return (
      <div className="space-y-4">
        {exportButtons}
        <ProductMixReport reportParams={reportParams} enabled={enabled} />
      </div>
    )
  }

  if (slug === ReportSlug.LOAN_SUMMARY) {
    return (
      <div className="space-y-4">
        {exportButtons}
        <LoanSummaryReport reportParams={reportParams} enabled={enabled} />
      </div>
    )
  }

  if (slug === ReportSlug.STOCK_REPORT) {
    return (
      <div className="space-y-4">
        {exportButtons}
        <StockReportView reportParams={reportParams} enabled={enabled} />
      </div>
    )
  }

  const isLoading =
    (isCustomerWise && customerPagedLoading) ||
    (isBalanceSheet && balanceLoading) ||
    (isWorkOrderDetails && woLoading && !isProductMix) ||
    (isProductMix && woLoading) ||
    (isExpenseReport && expensesLoading && !isExpenseByPurpose) ||
    (isExpenseByPurpose && expensesLoading) ||
    (isTrending && trendingLoading)

  if (isLoading) return <Loader />

  if (isCustomerWise) {
    if (customerList.length === 0) {
      return <NoDataFound message="No customer data" details="Try another date range." />
    }
    return (
      <>
        {customerSummary && (
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <ReportCard label="Customers" value={customerSummary.total_customers} format="number" />
            <ReportCard label="Work value" value={customerSummary.grand_total_amount} />
            <ReportCard label="Collected" value={customerSummary.grand_total_paid} />
            <ReportCard label="Pending" value={customerSummary.grand_total_pending} />
          </div>
        )}
        <ReportTable
          data={customerList}
          columns={CustomerWorkOrderReportColumns}
          pageIndex={pageIndex}
          pageSize={PAGE_SIZE}
          total={customerPagedData?.total ?? 0}
          title="Customer wise work orders"
          onPageChange={onPageChange}
          onDownloadPdf={handlePdf}
          onDownloadExcel={handleExcel}
        />
      </>
    )
  }

  if (isBalanceSheet && balanceSheetData?.data) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap justify-between gap-4">
          {balanceSheetData.period && (
            <p className="text-sm text-muted-foreground">
              Period: {balanceSheetData.period.start_date} to{' '}
              {balanceSheetData.period.end_date}
            </p>
          )}
          {exportButtons}
        </div>
        <p className="text-xs text-muted-foreground">
          Realized profit uses collected amounts only — pending excluded.
        </p>
        <div className="grid gap-4 md:grid-cols-4">
          <ReportCard label="Collected income" value={collected} />
          <ReportCard label="Expenses" value={expenses} />
          <ReportCard label="Realized net profit" value={realizedProfit} />
          <ReportCard
            label="Margin on collected"
            value={realizedMargin ?? 0}
            format="percent"
          />
        </div>
      </div>
    )
  }

  if (isWorkOrderDetails) {
    if (woList.length === 0) {
      return <NoDataFound message="No work orders" details="Try another date range." />
    }
    return (
      <WorkOrderDetailsReportTable
        data={woList}
        pageIndex={pageIndex}
        pageSize={PAGE_SIZE}
        total={woDetailsData?.total ?? 0}
        onPageChange={onPageChange}
        title="Work order profitability"
        onDownloadPdf={handlePdf}
        onDownloadExcel={handleExcel}
      />
    )
  }

  if (isExpenseReport) {
    if (expensesList.length === 0) {
      return <NoDataFound message="No expenses" details="Try another date range." />
    }
    return (
      <>
        {expensesSummary && (
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <ReportCard label="Total expenses" value={expensesSummary.total_expenses} />
            <ReportCard label="Count" value={expensesSummary.count} format="number" />
          </div>
        )}
        <ReportTable
          data={expensesList}
          columns={ExpenseReportV1Columns}
          pageIndex={pageIndex}
          pageSize={PAGE_SIZE}
          total={expensesData?.total ?? 0}
          title="Expense report"
          onPageChange={onPageChange}
          onDownloadPdf={handlePdf}
          onDownloadExcel={handleExcel}
        />
      </>
    )
  }

  if (isTrending) {
    if (trendingList.length === 0) {
      return <NoDataFound message="No trending data" details="Try another date range." />
    }
    const trendingTotal = trendingList.length
    const pagedTrending = trendingList.slice(
      pageIndex * PAGE_SIZE,
      pageIndex * PAGE_SIZE + PAGE_SIZE
    )
    return (
      <>
        {trendingSummary && (
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <ReportCard label="Total revenue" value={trendingSummary.total_revenue} />
            <ReportCard label="Total expenses" value={trendingSummary.total_expenses} />
            <ReportCard label="Total net profit" value={trendingSummary.total_net_profit} />
            <ReportCard label="Total orders" value={trendingSummary.total_orders} format="number" />
          </div>
        )}
        <TrendingReportChart data={trendingList} />
        <div className="mt-6">
          <ReportTable
            data={pagedTrending}
            columns={TrendingReportColumns}
            pageIndex={pageIndex}
            pageSize={PAGE_SIZE}
            total={trendingTotal}
            title="Trending report"
            onPageChange={onPageChange}
            onDownloadPdf={handlePdf}
            onDownloadExcel={handleExcel}
          />
        </div>
      </>
    )
  }

  return <NoDataFound message="Report not found" details="Select a report from the hub." />
}
