import { useState, useEffect, useMemo, useCallback } from "react"
import type { DateRange } from "react-day-picker"
import { subDays, format } from "date-fns"
import { Main } from "@/components/layout/main"
import DateRangeSearch from "@/components/DateRangeSearch"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { ReportType, REPORTS_PAGE_TYPES } from "@/utils/enums/reportType"
import { ReportCard } from "@/components/report/ReportCard"
import { ReportTable } from "@/components/report/ReportTable"
import { NoDataFound } from "@/components/NoDataFound"
import {
  useCustomerWorkOrdersReport,
  useBalanceSheetReportV1,
  useWorkOrderDetailsReport,
  useExpensesReportV1,
  useTrendingReport,
} from "@/hooks/useReportV1"
import {
  CustomerWorkOrderReportColumns,
  ExpenseReportV1Columns,
  TrendingReportColumns,
} from "@/components/report/reportV1Columns"
import { WorkOrderDetailsReportTable } from "@/components/report/WorkOrderDetailsReportTable"
import { TrendingReportChart } from "@/components/report/TrendingReportChart"
import Loader from "@/components/layout/Loader"
import { Combobox } from "@/components/ui/combobox"
import { Download } from "lucide-react"
import {
  generateCustomerWorkOrdersPdf,
  generateBalanceSheetPdf,
  generateWorkOrderDetailsPdf,
  generateExpenseReportV1Pdf,
  generateTrendingPdf,
} from "@/utils/enums/reportsV1Pdf"
import {
  generateCustomerWorkOrdersExcel,
  generateBalanceSheetExcel,
  generateWorkOrderDetailsExcel,
  generateExpenseReportV1Excel,
  generateTrendingExcel,
} from "@/utils/enums/reportsV1Excel"

const REPORTS_PAGE_SIZE = 10

const Reports = () => {
  const [pageIndex, setPageIndex] = useState(0)
  const defaultDateRange = useMemo(() => {
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 30)
    return { from: thirtyDaysAgo, to: today }
  }, [])

  const [reportType, setReportType] = useState<ReportType>()
  const [reportTypeSearch, setReportTypeSearch] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange)
  const [appliedFilters, setAppliedFilters] = useState<{
    reportType?: ReportType
    dateRange?: DateRange
  } | null>(null)

  const reportParams = useMemo(() => {
    const from = appliedFilters?.dateRange?.from
    const to = appliedFilters?.dateRange?.to
    return {
      startDate: from ? format(from, "yyyy-MM-dd") : undefined,
      endDate: to ? format(to, "yyyy-MM-dd") : undefined,
    }
  }, [appliedFilters?.dateRange])

  const paginatedReportParams = useMemo(
    () => ({
      ...reportParams,
      limit: REPORTS_PAGE_SIZE,
      offset: pageIndex * REPORTS_PAGE_SIZE,
    }),
    [reportParams, pageIndex]
  )

  const isReportTypeEnabled = true

  const { data: customerWorkOrdersData, isLoading: isCustomerWorkOrdersLoading } =
    useCustomerWorkOrdersReport(paginatedReportParams, {
      enabled:
        !!appliedFilters &&
        appliedFilters.reportType === ReportType.CUSTOMER_WISE_WORK_ORDER,
    })

  const { data: balanceSheetData, isLoading: isBalanceSheetLoading } =
    useBalanceSheetReportV1(reportParams, {
      enabled:
        !!appliedFilters && appliedFilters.reportType === ReportType.BALANCE_SHEET,
    })

  const { data: workOrderDetailsData, isLoading: isWorkOrderDetailsLoading } =
    useWorkOrderDetailsReport(paginatedReportParams, {
      enabled:
        !!appliedFilters &&
        appliedFilters.reportType === ReportType.WORK_ORDER_DETAILS,
    })

  const { data: expensesReportData, isLoading: isExpensesReportLoading } =
    useExpensesReportV1(paginatedReportParams, {
      enabled:
        !!appliedFilters && appliedFilters.reportType === ReportType.EXPENSE_REPORT,
    })

  const { data: trendingData, isLoading: isTrendingLoading } = useTrendingReport(
    reportParams,
    {
      enabled:
        !!appliedFilters &&
        appliedFilters.reportType === ReportType.TRENDING_REPORT,
    }
  )

  useEffect(() => {
    setReportType(undefined)
    setReportTypeSearch("")
    setAppliedFilters(null)
  }, [dateRange])

  const handleSearch = () => {
    setPageIndex(0)
    setAppliedFilters({ reportType, dateRange })
  }

  const handlePageChange = useCallback((newPageIndex: number) => {
    setPageIndex(newPageIndex)
  }, [])

  const handleReportTypeSelect = (value: string) => {
    setReportType(value as ReportType)
    setReportTypeSearch("")
  }

  const filteredReportTypes = useMemo(() => {
    const searchLower = reportTypeSearch.toLowerCase()
    return REPORTS_PAGE_TYPES.filter((type) => {
      if (!reportTypeSearch) return true
      return type.toLowerCase().includes(searchLower)
    }).map((type) => ({ value: type, label: type }))
  }, [reportTypeSearch])

  const isCustomerWise = appliedFilters?.reportType === ReportType.CUSTOMER_WISE_WORK_ORDER
  const isBalanceSheet = appliedFilters?.reportType === ReportType.BALANCE_SHEET
  const isWorkOrderDetails = appliedFilters?.reportType === ReportType.WORK_ORDER_DETAILS
  const isExpenseReport = appliedFilters?.reportType === ReportType.EXPENSE_REPORT
  const isTrending = appliedFilters?.reportType === ReportType.TRENDING_REPORT

  const isLoading =
    (isCustomerWise && isCustomerWorkOrdersLoading) ||
    (isBalanceSheet && isBalanceSheetLoading) ||
    (isWorkOrderDetails && isWorkOrderDetailsLoading) ||
    (isExpenseReport && isExpensesReportLoading) ||
    (isTrending && isTrendingLoading)

  const customerWorkOrdersList = customerWorkOrdersData?.data ?? []
  const customerWorkOrdersSummary = customerWorkOrdersData?.summary
  const customerWorkOrdersTotal = customerWorkOrdersData?.total ?? 0
  const workOrderDetailsList = workOrderDetailsData?.data ?? []
  const workOrderDetailsTotal = workOrderDetailsData?.total ?? 0
  const expensesList = expensesReportData?.data ?? []
  const expensesSummary = expensesReportData?.summary
  const expensesTotal = expensesReportData?.total ?? 0
  const trendingList = trendingData?.data ?? []
  const trendingSummary = trendingData?.summary

  const exportDateRange = useMemo(() => {
    const from = appliedFilters?.dateRange?.from
    const to = appliedFilters?.dateRange?.to
    if (!from || !to) return undefined
    return { from: format(from, "yyyy-MM-dd"), to: format(to, "yyyy-MM-dd") }
  }, [appliedFilters?.dateRange])

  const handleDownloadPdf = useCallback(() => {
    if (!appliedFilters?.reportType) return
    if (appliedFilters.reportType === ReportType.CUSTOMER_WISE_WORK_ORDER && customerWorkOrdersSummary) {
      generateCustomerWorkOrdersPdf(customerWorkOrdersList, customerWorkOrdersSummary, exportDateRange)
      return
    }
    if (appliedFilters.reportType === ReportType.BALANCE_SHEET && balanceSheetData) {
      generateBalanceSheetPdf(balanceSheetData, exportDateRange)
      return
    }
    if (appliedFilters.reportType === ReportType.WORK_ORDER_DETAILS && workOrderDetailsList.length > 0) {
      generateWorkOrderDetailsPdf(workOrderDetailsList, exportDateRange)
      return
    }
    if (appliedFilters.reportType === ReportType.EXPENSE_REPORT && expensesSummary) {
      generateExpenseReportV1Pdf(expensesList, expensesSummary, exportDateRange)
      return
    }
    if (appliedFilters.reportType === ReportType.TRENDING_REPORT && trendingSummary) {
      generateTrendingPdf(trendingList, trendingSummary, exportDateRange)
      return
    }
  }, [
    appliedFilters?.reportType,
    customerWorkOrdersList,
    customerWorkOrdersSummary,
    balanceSheetData,
    workOrderDetailsList,
    expensesList,
    expensesSummary,
    trendingList,
    trendingSummary,
    exportDateRange,
  ])

  const handleDownloadExcel = useCallback(() => {
    if (!appliedFilters?.reportType) return
    if (appliedFilters.reportType === ReportType.CUSTOMER_WISE_WORK_ORDER && customerWorkOrdersSummary) {
      generateCustomerWorkOrdersExcel(customerWorkOrdersList, customerWorkOrdersSummary, exportDateRange)
      return
    }
    if (appliedFilters.reportType === ReportType.BALANCE_SHEET && balanceSheetData) {
      generateBalanceSheetExcel(balanceSheetData, exportDateRange)
      return
    }
    if (appliedFilters.reportType === ReportType.WORK_ORDER_DETAILS && workOrderDetailsList.length > 0) {
      generateWorkOrderDetailsExcel(workOrderDetailsList, exportDateRange)
      return
    }
    if (appliedFilters.reportType === ReportType.EXPENSE_REPORT && expensesSummary) {
      generateExpenseReportV1Excel(expensesList, expensesSummary, exportDateRange)
      return
    }
    if (appliedFilters.reportType === ReportType.TRENDING_REPORT && trendingSummary) {
      generateTrendingExcel(trendingList, trendingSummary, exportDateRange)
      return
    }
  }, [
    appliedFilters?.reportType,
    customerWorkOrdersList,
    customerWorkOrdersSummary,
    balanceSheetData,
    workOrderDetailsList,
    expensesList,
    expensesSummary,
    trendingList,
    trendingSummary,
    exportDateRange,
  ])

  const hasData =
    (isCustomerWise && customerWorkOrdersList.length > 0) ||
    (isBalanceSheet && !!balanceSheetData?.data) ||
    (isWorkOrderDetails && workOrderDetailsList.length > 0) ||
    (isExpenseReport && expensesList.length > 0) ||
    (isTrending && trendingList.length > 0)

  return (
    <Main>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground">Comprehensive business reports</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 p-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Date range</label>
          <DateRangeSearch
            value={dateRange}
            onDateChange={(from, to) =>
              setDateRange(from && to ? { from, to } : undefined)
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Report type</label>
          <Combobox
            options={filteredReportTypes}
            placeholder="Search & select report type"
            emptyMessage="No report types found"
            value={reportType ?? reportTypeSearch}
            onSelect={handleReportTypeSelect}
            onSearch={setReportTypeSearch}
            onSearchClear={() => setReportTypeSearch("")}
            disabled={!isReportTypeEnabled}
            className="w-64"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={!reportType}
          className="flex gap-2"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {isLoading && <Loader />}

      {!appliedFilters && (
        <NoDataFound
          message="No report selected"
          details="Select a date range and report type, then click Search."
        />
      )}

      {appliedFilters && !isLoading && !hasData && (
        <NoDataFound
          message={
            isCustomerWise
              ? "No customer work order data"
              : isBalanceSheet
                ? "No balance sheet data"
                : isWorkOrderDetails
                  ? "No work order details"
                  : isExpenseReport
                    ? "No expenses found"
                    : isTrending
                      ? "No trending data"
                      : "No data found"
          }
          details="Try a different date range or report type."
        />
      )}

      {/* Customer Wise Work Order */}
      {appliedFilters && !isLoading && isCustomerWise && customerWorkOrdersList.length > 0 && (
        <>
          {customerWorkOrdersSummary && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <ReportCard
                label="Total customers"
                value={customerWorkOrdersSummary.total_customers}
              />
              <ReportCard
                label="Grand total amount"
                value={customerWorkOrdersSummary.grand_total_amount}
              />
              <ReportCard
                label="Grand total paid"
                value={customerWorkOrdersSummary.grand_total_paid}
              />
              <ReportCard
                label="Grand total pending"
                value={customerWorkOrdersSummary.grand_total_pending}
              />
            </div>
          )}
          <div className="mt-6">
            <ReportTable
              data={customerWorkOrdersList}
              columns={CustomerWorkOrderReportColumns}
              pageIndex={pageIndex}
              pageSize={REPORTS_PAGE_SIZE}
              total={customerWorkOrdersTotal}
              title="Customer Wise Work Order Report"
              onPageChange={handlePageChange}
              onDownloadPdf={handleDownloadPdf}
              onDownloadExcel={handleDownloadExcel}
            />
          </div>
        </>
      )}

      {/* Balance Sheet */}
      {appliedFilters && !isLoading && isBalanceSheet && balanceSheetData?.data && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {balanceSheetData.period && (
              <p className="text-sm text-muted-foreground">
                Period: {balanceSheetData.period.start_date} to{" "}
                {balanceSheetData.period.end_date}
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadExcel} className="gap-2">
                <Download className="h-4 w-4" />
                Download Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <ReportCard label="Income" value={balanceSheetData.data.income} />
            <ReportCard label="Expenses" value={balanceSheetData.data.expenses} />
            <ReportCard
              label="Net profit"
              value={balanceSheetData.data.net_profit}
            />
            <ReportCard
              label="Profit margin (%)"
              value={balanceSheetData.data.profit_margin_percent}
            />
          </div>
        </div>
      )}

      {/* Work Order Details */}
      {appliedFilters && !isLoading && isWorkOrderDetails && workOrderDetailsList.length > 0 && (
        <div className="mt-6">
          <WorkOrderDetailsReportTable
            data={workOrderDetailsList}
            pageIndex={pageIndex}
            pageSize={REPORTS_PAGE_SIZE}
            total={workOrderDetailsTotal}
            onPageChange={handlePageChange}
            title="Work Order Details Report"
            onDownloadPdf={handleDownloadPdf}
            onDownloadExcel={handleDownloadExcel}
          />
        </div>
      )}

      {/* Expense Report */}
      {appliedFilters && !isLoading && isExpenseReport && expensesList.length > 0 && (
        <>
          {expensesSummary && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <ReportCard
                label="Total expenses"
                value={expensesSummary.total_expenses}
              />
              <ReportCard label="Count" value={expensesSummary.count} />
            </div>
          )}
          <div className="mt-6">
            <ReportTable
              data={expensesList}
              columns={ExpenseReportV1Columns}
              pageIndex={pageIndex}
              pageSize={REPORTS_PAGE_SIZE}
              total={expensesTotal}
              title="Expense Report"
              onPageChange={handlePageChange}
              onDownloadPdf={handleDownloadPdf}
              onDownloadExcel={handleDownloadExcel}
            />
          </div>
        </>
      )}

      {/* Trending Report */}
      {appliedFilters && !isLoading && isTrending && trendingList.length > 0 && (
        <>
          {trendingSummary && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <ReportCard
                label="Total revenue"
                value={trendingSummary.total_revenue}
              />
              <ReportCard
                label="Total expenses"
                value={trendingSummary.total_expenses}
              />
              <ReportCard
                label="Total net profit"
                value={trendingSummary.total_net_profit}
              />
              <ReportCard
                label="Total orders"
                value={trendingSummary.total_orders}
              />
            </div>
          )}
          <div className="mt-6">
            <TrendingReportChart data={trendingList} />
          </div>
          <div className="mt-6">
            <ReportTable
              data={trendingList}
              columns={TrendingReportColumns}
              pageIndex={pageIndex}
              pageSize={REPORTS_PAGE_SIZE}
              total={trendingList.length}
              title="Trending Report"
              onPageChange={handlePageChange}
              onDownloadPdf={handleDownloadPdf}
              onDownloadExcel={handleDownloadExcel}
            />
          </div>
        </>
      )}
    </Main>
  )
}

export default Reports
