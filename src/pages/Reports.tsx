import { useState, useEffect, useMemo, useCallback } from "react"
import type { DateRange } from "react-day-picker"
import { subDays } from "date-fns"
import { Main } from "@/components/layout/main"
import DateRangeSearch from "@/components/DateRangeSearch"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { ReportType } from "@/utils/enums/reportType"
import { useShopStore } from "@/stores/shopStore"
import { useCustomerList } from "@/hooks/useCustomer"
import { useVendorList } from "@/hooks/useVendor"
import { useTransactionLedger } from "@/hooks/useTransaction"
import { ReportCard } from "@/components/report/ReportCard"
import { ReportTable } from "@/components/report/ReportTable"
import { BalanceSheetTable } from "@/components/report/BalanceSheetTable"
import type {
  TransactionLedgerDetailItem,
  TransactionReportItem,
  TransactionLedgerItem,
  TransactionDetailItem,
  ExpenseReportItem,
  StockReportItem,
  StockTrackReportItem,
} from "@/interface/reportInterface"
import { generateLedgerPDF } from "@/utils/enums/customerOrVendorLedgerPdf"
import { generateTransactionReportPDF } from "@/utils/enums/transactionReportPdf"
import { generateTransactionReportExcel } from "@/utils/enums/transactionReportExcel"
import { generateLedgerExcel } from "@/utils/enums/customerOrVendorLedgerExcel"
import { NoDataFound } from "@/components/NoDataFound"
import { TRANSACTION_TYPES } from "@/constance/transactionConstances"
import { useBalanceSheetReport, useExpensesReport, useStocksReport, useStocksReportTracking, useTransactionReport } from "@/hooks/useReport"
import { ExpensesReportColumns, LedgerReportColumns, TransactionReportColumns, StocksReportColumns, StockTrackReportColumns } from "@/components/report/ReportColumns"
import Loader from "@/components/layout/Loader"
import { generateExpenseReportPDF } from "@/utils/enums/expensesreportPdf"
import { generateExpenseReportExcel } from "@/utils/enums/expensesreportExcel"
import { generateStockReportPDF } from "@/utils/enums/stockReportPdf"
import { generateStockReportExcel } from "@/utils/enums/stockReportExcel"
import { Badge } from "@/components/ui/badge"
import { generateStockTrackReportPDF } from "@/utils/enums/stockTrackreportPdf"
import { generateStockTrackReportExcel } from "@/utils/enums/stockTrackreportExcel"
import { Combobox } from "@/components/ui/combobox"

const Reports = () => {
  const shopId = useShopStore((s) => s.currentShopId) ?? ""
  const [pageIndex, setPageIndex] = useState(0)
  const limit = 10

  // Calculate API page (1-indexed) from pageIndex (0-indexed)
  const page = pageIndex + 1

  const currentShopName = useShopStore((s) => s.currentShopName)

  // Default to last 30 days
  const defaultDateRange = useMemo(() => {
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 30)
    return {
      from: thirtyDaysAgo,
      to: today
    }
  }, [])

  //  states for immediate ui change
  const [reportType, setReportType] = useState<ReportType>()
  const [reportTypeSearch, setReportTypeSearch] = useState("")
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([])
  const [entitySearch, setEntitySearch] = useState("")
  const [transactionTypes, setTransactionTypes] = useState<string[]>([])
  const [transactionTypeSearch, setTransactionTypeSearch] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange)
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([])
  const [inventorySearch, setInventorySearch] = useState("")

  // trigger api states
  const [appliedFilters, setAppliedFilters] = useState<{
    reportType?: ReportType;
    entityIds?: string[];
    dateRange?: DateRange;
    transactionTypes?: string[];
    inventoryIds?: string[];
  } | null>(null)

  const isReportTypeEnabled = !!dateRange?.from && !!dateRange?.to
  const isEntityEnabled = isReportTypeEnabled && !!reportType

  // customer hook
  const { data: customerResponse } = useCustomerList(
    shopId, page, limit, entitySearch, undefined, undefined,
    { enabled: reportType === ReportType.CUSTOMER_LEDGER && isEntityEnabled }
  )

  // vendor hook
  const { data: vendorResponse } = useVendorList(
    shopId, page, limit, entitySearch, undefined, undefined,
    { enabled: reportType === ReportType.VENDOR_LEDGER && isEntityEnabled }
  )

  // Fetch all inventories for the select box (when Stock Report or Stock Track Report is selected)
  const { data: allInventoriesResponse } = useStocksReport(
    {
      shopId,
      page: page,
      limit: limit,
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString(),
      searchBy: inventorySearch,
    },
    {
      enabled: (reportType === ReportType.STOCK_REPORT || reportType === ReportType.STOCK_TRACK_REPORT) && isEntityEnabled
    }
  )

  // customer/vendor ledger hook
  const { data: ledger, isLoading: isLedgerLoading } = useTransactionLedger(
    shopId,
    page,
    appliedFilters?.entityIds?.[0] ?? "",
    limit,
    appliedFilters?.dateRange?.from?.toISOString(),
    appliedFilters?.dateRange?.to?.toISOString(),
  )

  // transaction report hook
  const { data: transactionData, isLoading: isTransactionLoading } = useTransactionReport(
    {
      shopId,
      page: page,
      limit: limit,
      startDate: appliedFilters?.dateRange?.from?.toISOString(),
      endDate: appliedFilters?.dateRange?.to?.toISOString(),
      transactionTypes: appliedFilters?.transactionTypes,
    },
    {
      enabled: !!appliedFilters &&
        appliedFilters.reportType === ReportType.TRANSACTION_REPORT &&
        !!appliedFilters.transactionTypes &&
        appliedFilters.transactionTypes.length > 0 &&
        !!appliedFilters.dateRange?.from &&
        !!appliedFilters.dateRange?.to
    }
  )

  // use expense report hook
  const { data: expensesdata, isLoading: isExpensesLoading } = useExpensesReport(
    {
      shopId,
      page: page,
      limit: limit,
      startDate: appliedFilters?.dateRange?.from?.toISOString(),
      endDate: appliedFilters?.dateRange?.to?.toISOString(),
    },
    {
      enabled:
        !!appliedFilters &&
        appliedFilters.reportType === ReportType.EXPENSE_REPORT &&
        !!appliedFilters.dateRange?.from &&
        !!appliedFilters.dateRange?.to,
    }
  )

  // stock report hook
  const { data: stocksResponse, isLoading: isStocksLoading } = useStocksReport(
    {
      shopId,
      page: page,
      limit: limit,
      startDate: appliedFilters?.dateRange?.from?.toISOString(),
      endDate: appliedFilters?.dateRange?.to?.toISOString(),
      ids: appliedFilters?.inventoryIds,
    },
    {
      enabled:
        !!appliedFilters &&
        appliedFilters.reportType === ReportType.STOCK_REPORT &&
        !!appliedFilters.dateRange?.from &&
        !!appliedFilters.dateRange?.to,
    }
  )

  // stock track report hook
  const { data: stockTrackResponse, isLoading: isStockTrackLoading } = useStocksReportTracking(
    {
      shopId,
      page: page,
      limit: limit,
      startDate: appliedFilters?.dateRange?.from?.toISOString(),
      endDate: appliedFilters?.dateRange?.to?.toISOString(),
      ids: appliedFilters?.inventoryIds,
    },
    {
      enabled:
        !!appliedFilters &&
        appliedFilters.reportType === ReportType.STOCK_TRACK_REPORT &&
        !!appliedFilters.dateRange?.from &&
        !!appliedFilters.dateRange?.to &&
        (appliedFilters.inventoryIds?.length ?? 0) > 0,
    }
  )

  // balance sheet report hook
  const { data: balanceSheetResponse, isLoading: isBalanceSheetLoading } = useBalanceSheetReport(
    {
      shopId,
      page: page,
      limit: limit,
      startDate: appliedFilters?.dateRange?.from?.toISOString(),
      endDate: appliedFilters?.dateRange?.to?.toISOString(),
    },
    {
      enabled:
        !!appliedFilters &&
        appliedFilters.reportType === ReportType.BALANCE_SHEET &&
        !!appliedFilters.dateRange?.from &&
        !!appliedFilters.dateRange?.to,
    }
  )

  // reset logic when parents change
  useEffect(() => {
    setReportType(undefined)
    setReportTypeSearch("")
    setSelectedEntityIds([])
    setEntitySearch("")
    setTransactionTypes([])
    setTransactionTypeSearch("")
    setSelectedInventoryIds([])
    setInventorySearch("")
    setAppliedFilters(null)
  }, [dateRange])

  useEffect(() => {
    setSelectedEntityIds([])
    setEntitySearch("")
    setTransactionTypes([])
    setTransactionTypeSearch("")
    setSelectedInventoryIds([])
    setInventorySearch("")
    setAppliedFilters(null)
    // don't reset reportTypeSearch here since we're in reportType's useEffect
  }, [reportType])

  const handleSearch = () => {
    setPageIndex(0) // Reset to first page when searching
    setAppliedFilters({
      reportType,
      entityIds: selectedEntityIds.length > 0 ? selectedEntityIds : undefined,
      dateRange,
      transactionTypes: transactionTypes.length > 0 ? transactionTypes : undefined,
      inventoryIds: selectedInventoryIds.length > 0 ? selectedInventoryIds : undefined
    })
  }

  // Handle page changes for report tables
  const handlePageChange = useCallback((newPageIndex: number) => {
    setPageIndex(newPageIndex)
  }, [])

  // report type handler
  const handleReportTypeSelect = (value: string) => {
    setReportType(value as ReportType)
    // clear search after selection
    setReportTypeSearch("")
  }

  const handleReportTypeSearchClear = () => {
    setReportTypeSearch("")
  }

  // handlers for entity (customer/vendor) multi-select
  const handleEntitySelect = (value: string) => {
    if (!value.trim()) return;

    // Check if already selected
    if (!selectedEntityIds.includes(value)) {
      setSelectedEntityIds(prev => [...prev, value])
    }

    // Clear search after selection
    setEntitySearch("")
  }

  const handleRemoveEntity = (entityId: string) => {
    const newIds = selectedEntityIds.filter(id => id !== entityId)
    setSelectedEntityIds(newIds)

    // Update applied filters to trigger data refetch
    if (appliedFilters?.reportType === ReportType.CUSTOMER_LEDGER ||
      appliedFilters?.reportType === ReportType.VENDOR_LEDGER) {
      if (newIds.length === 0) {
        setAppliedFilters(null)
      } else {
        setAppliedFilters({
          ...appliedFilters,
          entityIds: newIds
        })
      }
    }
  }

  const handleEntitySearchClear = () => {
    setEntitySearch("")
  }

  // handlers for transaction type multi-select
  const handleTransactionTypeSelect = (value: string) => {
    if (!value.trim()) return;

    // Check if already selected
    if (!transactionTypes.includes(value)) {
      setTransactionTypes(prev => [...prev, value])
    }

    // Clear search after selection
    setTransactionTypeSearch("")
  }

  const handleRemoveTransactionType = (transactionType: string) => {
    const newTypes = transactionTypes.filter(type => type !== transactionType)
    setTransactionTypes(newTypes)

    // Update applied filters to trigger data refetch
    if (appliedFilters?.reportType === ReportType.TRANSACTION_REPORT) {
      // If all types removed, fetch with all transaction types
      const typesToApply = newTypes.length === 0
        ? TRANSACTION_TYPES.map(t => t.value)
        : newTypes

      setAppliedFilters({
        ...appliedFilters,
        transactionTypes: typesToApply
      })
    }
  }

  const handleTransactionTypeSearchClear = () => {
    setTransactionTypeSearch("")
  }

  const handleInventorySelect = (value: string) => {
    if (!value.trim()) return;

    // Check if already selected
    if (!selectedInventoryIds.includes(value)) {
      setSelectedInventoryIds(prev => [...prev, value])
    }

    // Clear search after selection
    setInventorySearch("")
  }

  const handleRemoveInventory = (inventoryId: string) => {
    const newIds = selectedInventoryIds.filter(id => id !== inventoryId)
    setSelectedInventoryIds(newIds)

    // Update applied filters to trigger data refetch
    if (appliedFilters?.reportType === ReportType.STOCK_REPORT) {
      // Stock report allows empty inventory selection (shows all)
      setAppliedFilters({
        ...appliedFilters,
        inventoryIds: newIds.length > 0 ? newIds : undefined
      })
    } else if (appliedFilters?.reportType === ReportType.STOCK_TRACK_REPORT) {
      // If all inventories removed, fetch with all available inventories
      if (newIds.length === 0 && allInventoriesResponse?.data) {
        const allInventoryIds = allInventoriesResponse.data.map((inv: StockReportItem) => inv.id)
        setAppliedFilters({
          ...appliedFilters,
          inventoryIds: allInventoryIds
        })
      } else {
        setAppliedFilters({
          ...appliedFilters,
          inventoryIds: newIds
        })
      }
    }
  }

  const handleInventorySearchClear = () => {
    setInventorySearch("")
  }

  // filter inventories based on search and already selected
  const filteredInventories = useMemo(() => {
    if (!allInventoriesResponse?.data) return []

    const searchLower = inventorySearch.toLowerCase()
    return allInventoriesResponse.data
      .filter((inventory: StockReportItem) => {
        const matchesSearch = !inventorySearch ||
          inventory.name.toLowerCase().includes(searchLower)
        const notSelected = !selectedInventoryIds.includes(inventory.id)
        return matchesSearch && notSelected
      })
      .map((inventory: StockReportItem) => ({
        value: inventory.id,
        label: inventory.name
      }))
  }, [allInventoriesResponse, inventorySearch, selectedInventoryIds])

  // filter transaction types based on search and already selected
  const filteredTransactionTypes = useMemo(() => {
    const searchLower = transactionTypeSearch.toLowerCase()
    return TRANSACTION_TYPES.filter(type => {
      const matchesSearch = !transactionTypeSearch ||
        type.label.toLowerCase().includes(searchLower) ||
        type.value.toLowerCase().includes(searchLower)
      const notSelected = !transactionTypes.includes(type.value)
      return matchesSearch && notSelected
    }).map(type => ({
      value: type.value,
      label: type.label
    }))
  }, [transactionTypeSearch, transactionTypes])

  // filter report types based on search
  const filteredReportTypes = useMemo(() => {
    const searchLower = reportTypeSearch.toLowerCase()
    return Object.values(ReportType)
      .filter(type => {
        if (!reportTypeSearch) return true
        return type.toLowerCase().includes(searchLower)
      })
      .map(type => ({
        value: type,
        label: type
      }))
  }, [reportTypeSearch])

  const detailRows: TransactionLedgerDetailItem[] = ledger?.transactions.flatMap(
    (tran: TransactionLedgerItem) =>
      tran.details.map((det: TransactionDetailItem) => ({
        id: det.id,
        transactionNo: tran.no,
        createdAt: tran.createdAt,
        transactionType: tran.transactionType,
        entityName: tran.customer?.name ?? tran.vendor?.name ?? "",
        inventoryName: det.inventory?.name ?? "",
        quantity: det.quantity?.toString() ?? "0",
        price: det.price?.toString() ?? "0",
        total: det.total?.toString() ?? "0",
        paymentType: tran.paymentType,
        unitOfMeasurement: det.unitOfMeasurement,
      }))
  ) ?? []

  const entityNames = appliedFilters?.entityIds
    ? appliedFilters.entityIds.map(id => {
      if (appliedFilters.reportType === ReportType.CUSTOMER_LEDGER) {
        return customerResponse?.customers.find(c => c.id === id)?.name ?? "Customer"
      } else {
        return vendorResponse?.data.find(v => v.id === id)?.name ?? "Vendor"
      }
    }).join(", ")
    : "Unknown"

  const handleDownloadPdf = () => {
    // transaction report pdf
    if (appliedFilters?.reportType === ReportType.TRANSACTION_REPORT && transactionData?.data) {
      generateTransactionReportPDF(
        transactionData.data,
        currentShopName ?? "Shop Name",
        appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
          from: appliedFilters.dateRange.from.toISOString(),
          to: appliedFilters.dateRange.to.toISOString()
        } : undefined,
        appliedFilters.transactionTypes?.join(", ")
      );
      return
    }

    // expense report pdf
    if (appliedFilters?.reportType === ReportType.EXPENSE_REPORT && expensesdata) {
      generateExpenseReportPDF(
        expensesdata,
        currentShopName ?? "Shop Name",
        appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
          from: appliedFilters.dateRange.from.toISOString(),
          to: appliedFilters.dateRange.to.toISOString()
        } : undefined
      );
      return
    }

    // stock report pdf
    if (appliedFilters?.reportType === ReportType.STOCK_REPORT && stocksData.length > 0) {
      generateStockReportPDF(
        stocksData,
        currentShopName ?? "Shop Name",
        appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
          from: appliedFilters.dateRange.from.toISOString(),
          to: appliedFilters.dateRange.to.toISOString()
        } : undefined
      );
      return;
    }

    // stock track report pdf - Add your PDF generation function here
    if (appliedFilters?.reportType === ReportType.STOCK_TRACK_REPORT && stockTrackData.length > 0) {
      generateStockTrackReportPDF(
        stockTrackData,
        currentShopName ?? "Shop Name",
        appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
          from: appliedFilters.dateRange.from.toISOString(),
          to: appliedFilters.dateRange.to.toISOString()
        } : undefined
      );
      return;
    }

    // ledger report pdf
    if (!ledger || !appliedFilters?.entityIds || appliedFilters.entityIds.length === 0) return; // ← CHANGE

    generateLedgerPDF(
      entityNames,
      currentShopName ?? "Shop Name",
      detailRows,
      {
        totalAmount: ledger.totalAmount,
        totalPaid: ledger.paid,
      },
      appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
        from: appliedFilters.dateRange.from.toISOString(),
        to: appliedFilters.dateRange.to.toISOString()
      } : undefined,
      appliedFilters.reportType === ReportType.CUSTOMER_LEDGER ? "customer" : "vendor"
    )
  }

  const handleDownloadExcel = () => {
    // transaction report excel
    if (appliedFilters?.reportType === ReportType.TRANSACTION_REPORT && transactionData?.data) {
      generateTransactionReportExcel(
        transactionData.data,
        currentShopName ?? "Shop Name",
        appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
          from: appliedFilters.dateRange.from.toISOString(),
          to: appliedFilters.dateRange.to.toISOString()
        } : undefined,
        appliedFilters.transactionTypes?.join(", ")
      )
      return
    }

    // expense report excel
    if (appliedFilters?.reportType === ReportType.EXPENSE_REPORT && expensesdata) {
      generateExpenseReportExcel(
        expensesdata,
        currentShopName ?? "Shop Name",
        appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
          from: appliedFilters.dateRange.from.toISOString(),
          to: appliedFilters.dateRange.to.toISOString()
        } : undefined
      );
      return;
    }

    // stock report excel
    if (appliedFilters?.reportType === ReportType.STOCK_REPORT && stocksData.length > 0) {
      generateStockReportExcel(
        stocksData,
        currentShopName ?? "Shop Name",
        appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
          from: appliedFilters.dateRange.from.toISOString(),
          to: appliedFilters.dateRange.to.toISOString()
        } : undefined
      );
      return;
    }

    // stock track report excel - Add your Excel generation function here
    if (appliedFilters?.reportType === ReportType.STOCK_TRACK_REPORT && stockTrackData.length > 0) {
      generateStockTrackReportExcel(
        stockTrackData,
        currentShopName ?? "Shop Name",
        appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
          from: appliedFilters.dateRange.from.toISOString(),
          to: appliedFilters.dateRange.to.toISOString()
        } : undefined
      );
      return;
    }

    // ledger report excel
    if (!ledger || !appliedFilters?.entityIds || appliedFilters.entityIds.length === 0) return // ← CHANGE
    generateLedgerExcel(
      currentShopName ?? "Shop Name",
      entityNames,
      detailRows,
      appliedFilters?.dateRange?.from && appliedFilters?.dateRange?.to
        ? {
          from: appliedFilters.dateRange.from.toISOString(),
          to: appliedFilters.dateRange.to.toISOString(),
        }
        : undefined
    )
  }

  // filter customers/vendors based on search and already selected
  const filteredEntities = useMemo(() => {
    if (reportType === ReportType.CUSTOMER_LEDGER && customerResponse?.customers) {
      return customerResponse.customers
        .filter(c => !selectedEntityIds.includes(c.id))
        .map(c => ({
          value: c.id,
          label: c.name
        }))
    } else if (reportType === ReportType.VENDOR_LEDGER && vendorResponse?.data) {
      return vendorResponse.data
        .filter(v => !selectedEntityIds.includes(v.id))
        .map(v => ({
          value: v.id,
          label: v.name
        }))
    }
    return []
  }, [reportType, customerResponse, vendorResponse, selectedEntityIds])

  // determine if we're in transaction report mode
  const isTransactionReport = appliedFilters?.reportType === ReportType.TRANSACTION_REPORT
  const isLedgerReport = appliedFilters?.reportType === ReportType.CUSTOMER_LEDGER || appliedFilters?.reportType === ReportType.VENDOR_LEDGER
  const isExpenseReport = appliedFilters?.reportType === ReportType.EXPENSE_REPORT
  const isStockReport = appliedFilters?.reportType === ReportType.STOCK_REPORT
  const isStockTrackReport = appliedFilters?.reportType === ReportType.STOCK_TRACK_REPORT
  const isBalanceSheetReport = appliedFilters?.reportType === ReportType.BALANCE_SHEET

  // determine loading state
  const isLoading = isTransactionReport
    ? isTransactionLoading
    : isExpenseReport
      ? isExpensesLoading
      : isStockReport
        ? isStocksLoading
        : isStockTrackReport
          ? isStockTrackLoading
          : isBalanceSheetReport
            ? isBalanceSheetLoading
            : isLedgerLoading

  // Extract stock data from response
  const stocksData = stocksResponse?.data || []
  const stockTrackData = stockTrackResponse?.data || []


  // determine if we have data to show
  const hasData = isTransactionReport
    ? (transactionData?.data && transactionData.data.length > 0)
    : isExpenseReport
      ? (!!expensesdata && expensesdata.length > 0)
      : isStockReport
        ? (stocksData.length > 0)
        : isStockTrackReport
          ? (stockTrackData.length > 0)
          : isBalanceSheetReport
            ? (balanceSheetResponse?.data && balanceSheetResponse.data.length > 0)
            : (detailRows.length > 0 && ledger)

  return (
    <Main>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground">Comprehensive business reports</p>
        </div>
      </div>

      <div className="flex items-end gap-4 flex-wrap p-4">
        {/* date range input */}
        <div>
          <label className="text-sm font-medium mb-1 block">Date Range</label>
          <DateRangeSearch
            value={dateRange}
            onDateChange={(from, to) => setDateRange(from && to ? { from, to } : undefined)}
          />
        </div>

        {/* report type combobox */}
        <div>
          <label className="text-sm font-medium mb-1 block">Report Type</label>
          <Combobox
            options={filteredReportTypes}
            placeholder="Search & select report type"
            emptyMessage="No report types found"
            value={reportType || reportTypeSearch}
            onSelect={handleReportTypeSelect}
            onSearch={setReportTypeSearch}
            onSearchClear={handleReportTypeSearchClear}
            disabled={!isReportTypeEnabled}
            className="w-64"
          />
        </div>

        {/* transaction type combobox */}
        {reportType === ReportType.TRANSACTION_REPORT && (
          <div>
            <label className="text-sm font-medium mb-1 block">Transaction Types (Required)</label>
            <Combobox
              options={filteredTransactionTypes}
              placeholder="Search & select types"
              emptyMessage="No transaction types found"
              value={transactionTypeSearch}
              onSelect={handleTransactionTypeSelect}
              onSearch={setTransactionTypeSearch}
              onSearchClear={handleTransactionTypeSearchClear}
              className="w-64"
            />
          </div>
        )}

        {/* customer/vendor combobox - Only show for CUSTOMER_LEDGER and VENDOR_LEDGER */}
        {isEntityEnabled &&
          (reportType === ReportType.CUSTOMER_LEDGER || reportType === ReportType.VENDOR_LEDGER) && (
            <div>
              <label className="text-sm font-medium mb-1 block">
                {reportType === ReportType.CUSTOMER_LEDGER ? "Select Customers (Required)" : "Select Vendors (Required)"}
              </label>
              <Combobox
                options={filteredEntities}
                placeholder={`Search & select ${reportType === ReportType.CUSTOMER_LEDGER ? "customers" : "vendors"}`}
                emptyMessage={`No ${reportType === ReportType.CUSTOMER_LEDGER ? "customers" : "vendors"} found`}
                value={entitySearch}
                onSelect={handleEntitySelect}
                onSearch={setEntitySearch}
                onSearchClear={handleEntitySearchClear}
                className="w-64"
              />
            </div>
          )}

        {/* inventory combobox - Show for STOCK_REPORT and STOCK_TRACK_REPORT */}
        {isEntityEnabled && (reportType === ReportType.STOCK_REPORT || reportType === ReportType.STOCK_TRACK_REPORT) && (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Select Inventories {reportType === ReportType.STOCK_REPORT ? "(Optional)" : "(Required)"}
            </label>
            <Combobox
              options={filteredInventories}
              placeholder="Search & select inventories"
              emptyMessage="No inventories found"
              value={inventorySearch}
              onSelect={handleInventorySelect}
              onSearch={setInventorySearch}
              onSearchClear={handleInventorySearchClear}
              className="w-64"
            />
          </div>
        )}

        {/* search button */}
        <Button
          onClick={handleSearch}
          disabled={
            !reportType ||
            !dateRange?.from ||
            (reportType === ReportType.TRANSACTION_REPORT && transactionTypes.length === 0) ||
            ((reportType === ReportType.CUSTOMER_LEDGER || reportType === ReportType.VENDOR_LEDGER) && selectedEntityIds.length === 0) ||
            (reportType === ReportType.STOCK_TRACK_REPORT && selectedInventoryIds.length === 0)
          }
          className="flex gap-2"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {/* Transaction Types Badges */}
      {reportType === ReportType.TRANSACTION_REPORT && transactionTypes.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium">Selected Transaction Types:</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTransactionTypes([])
                setAppliedFilters(null)
              }}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {transactionTypes.map((type) => {
              const transactionType = TRANSACTION_TYPES.find(t => t.value === type)
              return (
                <Badge key={type} variant="secondary" className="flex items-center gap-2 px-2 py-1">
                  <span>{transactionType?.label || type}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      handleRemoveTransactionType(type)
                    }}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
                  </button>
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* Entities Badges */}
      {(reportType === ReportType.CUSTOMER_LEDGER || reportType === ReportType.VENDOR_LEDGER) && selectedEntityIds.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium">
              Selected {reportType === ReportType.CUSTOMER_LEDGER ? "Customers" : "Vendors"}:
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedEntityIds([])
                setAppliedFilters(null)
              }}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedEntityIds.map((id) => {
              const entity = reportType === ReportType.CUSTOMER_LEDGER
                ? customerResponse?.customers.find(c => c.id === id)
                : vendorResponse?.data.find(v => v.id === id)
              return (
                <Badge key={id} variant="secondary" className="flex items-center gap-2 px-2 py-1">
                  <span>{entity?.name || id}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      handleRemoveEntity(id)
                    }}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
                  </button>
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* Inventories Badges */}
      {(reportType === ReportType.STOCK_REPORT || reportType === ReportType.STOCK_TRACK_REPORT) && selectedInventoryIds.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium">Selected Inventories:</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedInventoryIds([])
                if (reportType === ReportType.STOCK_REPORT) {
                  setAppliedFilters({
                    reportType,
                    entityIds: selectedEntityIds,
                    dateRange,
                    transactionTypes,
                    inventoryIds: undefined
                  })
                }
                if (reportType === ReportType.STOCK_TRACK_REPORT) {
                  setAppliedFilters(null)
                }
              }}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedInventoryIds.map((id) => {
              const inventory = allInventoriesResponse?.data?.find((inv: StockReportItem) => inv.id === id)
              return (
                <Badge key={id} variant="secondary" className="flex items-center gap-2 px-2 py-1">
                  <span>{inventory?.name || id}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      handleRemoveInventory(id)
                    }}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
                  </button>
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* cards data for customer/vendor ledger */}
      {appliedFilters && isLedgerReport && hasData && ledger && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <ReportCard label="Total Amount" value={ledger.totalAmount} />
          <ReportCard label="Total Paid" value={ledger.paid} />
          <ReportCard label="Total Pending" value={ledger.totalPending} />
        </div>
      )}

      {/* card data for transaction reports */}
      {appliedFilters && isTransactionReport && hasData && transactionData?.data && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <ReportCard
            label="Total Amount"
            value={transactionData.data.reduce(
              (sum: number, t: TransactionReportItem) => sum + t.totalAmount, 0)}
          />
          <ReportCard
            label="Total Paid"
            value={transactionData.data.reduce(
              (sum: number, t: TransactionReportItem) => sum + t.paid, 0)}
          />
          <ReportCard
            label="Total Due"
            value={transactionData.data.reduce(
              (sum: number, t: TransactionReportItem) => sum + (t.totalAmount - t.paid), 0)}
          />
        </div>
      )}

      {/* card expense*/}
      {appliedFilters && isExpenseReport && hasData && expensesdata && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <ReportCard
            label="Total Expenses"
            value={expensesdata.reduce((s: number, e: ExpenseReportItem) => s + e.amount, 0)}
          />
        </div>
      )}

      {/* balance sheet cards */}
      {appliedFilters && isBalanceSheetReport && hasData && balanceSheetResponse?.data && balanceSheetResponse.data.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          {(() => {
            // Backend sends data in ascending order, so last item is the latest
            const latestDay = balanceSheetResponse.data[balanceSheetResponse.data.length - 1]
            const closingBalance = latestDay.closingBalance
            return (
              <>
                <ReportCard label="Opening Balance" value={closingBalance.openingBalance} />
                <ReportCard label="Total In" value={closingBalance.totalInflow} />
                <ReportCard label="Total Out" value={closingBalance.totalOutflow} />
                <ReportCard label="Closing Balance" value={closingBalance.closingBalance} />
              </>
            )
          })()}
        </div>
      )}

      {/* loading state */}
      {isLoading && <Loader />}

      {/* empty state */}
      {!appliedFilters && (
        <NoDataFound
          message="No report selected"
          details="Select a date range and report type to generate your report."
        />
      )}

      {appliedFilters && !isLoading && !hasData && (
        <NoDataFound
          message={
            isExpenseReport
              ? "No Expenses Found"
              : isStockReport
                ? "No Stock Data Found"
                : isStockTrackReport
                  ? "No Stock Track Data Found"
                  : isBalanceSheetReport
                    ? "No Balance Sheet Data Found"
                    : "No Transactions Found"
          }
          details={
            isExpenseReport
              ? "There are no recorded expenses for the selected date range."
              : isStockReport
                ? "No stock data matches your selected filters and date range."
                : isStockTrackReport
                  ? "No stock tracking data matches your selected filters and date range."
                  : isBalanceSheetReport
                    ? "No balance sheet data matches your selected date range."
                    : "No data matches your selected filters and date range."
          }
        />
      )}

      {/* transaction report table */}
      {appliedFilters && !isLoading && isTransactionReport && transactionData?.data && transactionData.data.length > 0 && (
        <ReportTable<TransactionReportItem>
          data={transactionData.data}
          columns={TransactionReportColumns}
          pageIndex={pageIndex}
          pageSize={limit}
          total={transactionData.total ?? 0}
          onPageChange={handlePageChange}
          onDownloadPdf={handleDownloadPdf}
          onDownloadExcel={handleDownloadExcel}
          title="Transaction Report"
        />
      )}

      {/* ledger report table */}
      {appliedFilters && !isLoading && isLedgerReport && detailRows.length > 0 && ledger && (
        <ReportTable<TransactionLedgerDetailItem>
          data={detailRows}
          columns={LedgerReportColumns}
          pageIndex={pageIndex}
          pageSize={limit}
          total={ledger.total}
          onPageChange={handlePageChange}
          onDownloadPdf={handleDownloadPdf}
          onDownloadExcel={handleDownloadExcel}
          entityName={entityNames}
          title="Ledger Details"
        />
      )}

      {/* expenses table */}
      {appliedFilters && !isLoading && isExpenseReport && expensesdata && expensesdata.length > 0 && (
        <ReportTable<ExpenseReportItem>
          data={expensesdata}
          columns={ExpensesReportColumns}
          pageIndex={pageIndex}
          pageSize={limit}
          total={expensesdata.length}
          title="Expenses Report"
          onPageChange={handlePageChange}
          onDownloadPdf={handleDownloadPdf}
          onDownloadExcel={handleDownloadExcel}
        />
      )}

      {/* stocks table */}
      {appliedFilters && !isLoading && isStockReport && stocksData.length > 0 && (
        <ReportTable<StockReportItem>
          data={stocksData}
          columns={StocksReportColumns}
          pageIndex={pageIndex}
          pageSize={limit}
          total={stocksResponse?.total ?? stocksData.length}
          title="Stock Report"
          onPageChange={handlePageChange}
          onDownloadPdf={handleDownloadPdf}
          onDownloadExcel={handleDownloadExcel}
        />
      )}

      {/* stock track table */}
      {appliedFilters && !isLoading && isStockTrackReport && stockTrackData.length > 0 && (
        <ReportTable<StockTrackReportItem>
          data={stockTrackData}
          columns={StockTrackReportColumns}
          pageIndex={pageIndex}
          pageSize={limit}
          total={stockTrackResponse?.total ?? stockTrackData.length}
          title="Stock Track Report"
          onPageChange={handlePageChange}
          onDownloadPdf={handleDownloadPdf}
          onDownloadExcel={handleDownloadExcel}
        />
      )}

      {/* balance sheet table */}
      {appliedFilters && !isLoading && isBalanceSheetReport && balanceSheetResponse?.data && balanceSheetResponse.data.length > 0 && (
        <BalanceSheetTable
          data={balanceSheetResponse.data}
          pageIndex={pageIndex}
          pageSize={limit}
          total={balanceSheetResponse.total ?? balanceSheetResponse.data.length}
          title="Balance Sheet Report"
          onPageChange={handlePageChange}
          onDownloadPdf={handleDownloadPdf}
          onDownloadExcel={handleDownloadExcel}
        />
      )}
    </Main>
  )
}

export default Reports