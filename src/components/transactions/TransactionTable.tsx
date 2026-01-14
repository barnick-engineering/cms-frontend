import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { X } from "lucide-react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { DataTableViewOptions } from "./DataTableViewOption"
import { DataTablePagination } from "./DataTablePagination"
import { TransactionColumns as columns } from "./TransactionColumns"
import type { Transaction } from "@/interface/transactionInterface"
import { DataTableBulkActions } from "../customers/DataTableBulkActions"
import DateRangeSearch from "../DateRangeSearch"
import { useDebounce } from "@/hooks/useDebounce"
import { NoDataFound } from "../NoDataFound"
import { Combobox } from "../ui/combobox"
import { TRANSACTION_TYPES } from "@/constance/transactionConstances"
import { useVendorList } from "@/hooks/useVendor"
import { useCustomerList } from "@/hooks/useCustomer"
import { useShopStore } from "@/stores/shopStore"

interface TransactionTableProps {
  shopId: string
  data: Transaction[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (pageIndex: number) => void
  onSearchChange?: (searchBy?: string, startDate?: Date, endDate?: Date) => void
  onFiltersChange?: (transactionTypes: string[], vendorIds: string[], customerIds: string[]) => void
  initialDateRange?: { from: Date; to: Date }
}

const TransactionTable = ({
  shopId: _shopId,
  data,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onSearchChange,
  onFiltersChange,
  initialDateRange
}: TransactionTableProps) => {
  const navigate = useNavigate()
  const shopId = useShopStore((s) => s.currentShopId) ?? ""
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Search states
  const [searchInput, setSearchInput] = useState("")
  // Initialize with default date range
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(
    initialDateRange || {}
  )
  // Track if date range is actively selected
  const [isDateRangeActive, setIsDateRangeActive] = useState(true)

  // Filter states - now using arrays for multi-select
  const [selectedTransactionTypes, setSelectedTransactionTypes] = useState<string[]>([])
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([])
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([])
  const [transactionTypeSearch, setTransactionTypeSearch] = useState("")
  const [vendorSearch, setVendorSearch] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")

  // Fetch vendors and customers for comboboxes
  const { data: vendorResponse } = useVendorList(shopId, 1, 10, vendorSearch)
  const { data: customerResponse } = useCustomerList(shopId, 1, 10, customerSearch)

  // Memoized options for comboboxes - filter out already selected items
  const transactionTypeOptions = useMemo(() => 
    TRANSACTION_TYPES
      .filter(t => !selectedTransactionTypes.includes(t.value))
      .map(t => ({ value: t.value, label: t.label })),
    [selectedTransactionTypes]
  )

  const vendorOptions = useMemo(() => {
    return (vendorResponse?.data || [])
      .filter(v => !selectedVendorIds.includes(v.id))
      .map(v => ({ value: v.id, label: v.name }))
  }, [vendorResponse, selectedVendorIds])

  const customerOptions = useMemo(() => {
    return (customerResponse?.customers || [])
      .filter(c => !selectedCustomerIds.includes(c.id))
      .map(c => ({ value: c.id, label: c.name }))
  }, [customerResponse, selectedCustomerIds])

  // Handlers for multi-select
  const handleTransactionTypeSelect = (value: string) => {
    if (!value.trim() || selectedTransactionTypes.includes(value)) return
    setSelectedTransactionTypes(prev => [...prev, value])
    setTransactionTypeSearch("")
  }

  const handleRemoveTransactionType = (value: string) => {
    setSelectedTransactionTypes(prev => prev.filter(t => t !== value))
  }

  const handleVendorSelect = (value: string) => {
    if (!value.trim() || selectedVendorIds.includes(value)) return
    setSelectedVendorIds(prev => [...prev, value])
    setVendorSearch("")
  }

  const handleRemoveVendor = (value: string) => {
    setSelectedVendorIds(prev => prev.filter(v => v !== value))
  }

  const handleCustomerSelect = (value: string) => {
    if (!value.trim() || selectedCustomerIds.includes(value)) return
    setSelectedCustomerIds(prev => [...prev, value])
    setCustomerSearch("")
  }

  const handleRemoveCustomer = (value: string) => {
    setSelectedCustomerIds(prev => prev.filter(c => c !== value))
  }

  // Debounce search input (300ms delay)
  const debouncedSearch = useDebounce(searchInput, 300)

  // Track if this is the initial render
  const isFirstRender = useRef(true)
  const prevSearchRef = useRef(debouncedSearch)
  const prevDateFromRef = useRef(dateRange.from)
  const prevDateToRef = useRef(dateRange.to)
  const prevTransactionTypesRef = useRef<string[]>([])
  const prevVendorIdsRef = useRef<string[]>([])
  const prevCustomerIdsRef = useRef<string[]>([])

  // Handle search input and date range changes with conditional parameter sending
  useEffect(() => {
    // On initial render, just update refs without resetting page
    if (isFirstRender.current) {
      isFirstRender.current = false
      prevSearchRef.current = debouncedSearch
      prevDateFromRef.current = dateRange.from
      prevDateToRef.current = dateRange.to
      return
    }

    // Only reset page if search or date values actually changed
    const searchChanged = prevSearchRef.current !== debouncedSearch
    const dateFromChanged = prevDateFromRef.current !== dateRange.from
    const dateToChanged = prevDateToRef.current !== dateRange.to

    if (searchChanged || dateFromChanged || dateToChanged) {
      onPageChange(0) // Reset to first page only when search/date changes
      
      // Apply conditional logic for sending parameters
      if (debouncedSearch) {
        // If there's a search query, don't send date range
        onSearchChange?.(debouncedSearch, undefined, undefined)
        setIsDateRangeActive(false)
      } else if (isDateRangeActive && dateRange.from && dateRange.to) {
        // If no search query and date range is active, send date range
        onSearchChange?.(undefined, dateRange.from, dateRange.to)
      } else {
        // If no search and no active date range, send nothing
        onSearchChange?.(undefined, undefined, undefined)
      }

      // Update refs
      prevSearchRef.current = debouncedSearch
      prevDateFromRef.current = dateRange.from
      prevDateToRef.current = dateRange.to
    }
  }, [debouncedSearch, onPageChange, onSearchChange, dateRange.from, dateRange.to, isDateRangeActive])

  // Handle filter changes - only trigger when arrays actually change
  useEffect(() => {
    const typesChanged = JSON.stringify(prevTransactionTypesRef.current) !== JSON.stringify(selectedTransactionTypes)
    const vendorsChanged = JSON.stringify(prevVendorIdsRef.current) !== JSON.stringify(selectedVendorIds)
    const customersChanged = JSON.stringify(prevCustomerIdsRef.current) !== JSON.stringify(selectedCustomerIds)

    if (typesChanged || vendorsChanged || customersChanged) {
      prevTransactionTypesRef.current = [...selectedTransactionTypes]
      prevVendorIdsRef.current = [...selectedVendorIds]
      prevCustomerIdsRef.current = [...selectedCustomerIds]
      onFiltersChange?.(selectedTransactionTypes, selectedVendorIds, selectedCustomerIds)
    }
  }, [selectedTransactionTypes, selectedVendorIds, selectedCustomerIds, onFiltersChange])

  // Handle date range changes from the date picker
  const handleDateChange = (from?: Date, to?: Date) => {
    setDateRange({ from, to })
    setIsDateRangeActive(!!(from && to)) // Mark date range as active if both dates exist
    
    // Clear search input when date range is selected
    if (from && to && searchInput) {
      setSearchInput('')
    }
    
    onPageChange(0) // Reset to first page when date range changes
  }

  // Handle search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    
    // When user starts typing, deactivate date range
    if (value) {
      setIsDateRangeActive(false)
    } else {
      // When search is cleared, reactivate date range if it exists
      setIsDateRangeActive(!!(dateRange.from && dateRange.to))
    }
  }

  const table = useReactTable<Transaction>({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      pagination: { pageIndex, pageSize }
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize })
        onPageChange(newState.pageIndex)
      } else {
        onPageChange(updater.pageIndex)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // transaction profile page
  const handleClick = (id: string) => {
    navigate(`/transactions/${id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-1 flex-col gap-y-2">
        {/* First row: Date range, search input, and view options */}
        <div className="flex flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center gap-x-2">
            {/* Pass value prop to show selected date range */}
            <DateRangeSearch 
              onDateChange={handleDateChange}
              value={isDateRangeActive && dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
            />
            {/* Use custom handler instead of direct onChange */}
            <Input
              placeholder="Filter transactions..."
              value={searchInput}
              onChange={handleSearchInputChange}
              className="h-8 w-37.5 lg:w-62.5"
            />
          </div>

          <div className="flex items-center">
            <DataTableViewOptions table={table} />
          </div>
        </div>

        {/* Second row: Filter comboboxes */}
        <div className="flex flex-wrap gap-2 items-center">
          <Combobox
            options={transactionTypeOptions}
            placeholder="Transaction Type"
            emptyMessage="No more types"
            value={transactionTypeSearch}
            onSelect={handleTransactionTypeSelect}
            onSearch={setTransactionTypeSearch}
            onSearchClear={() => setTransactionTypeSearch("")}
            className="h-8 w-40"
          />
          <Combobox
            options={vendorOptions}
            placeholder="Vendor"
            emptyMessage="No vendors found"
            value={vendorSearch}
            onSelect={handleVendorSelect}
            onSearch={setVendorSearch}
            onSearchClear={() => setVendorSearch("")}
            className="h-8 w-40"
          />
          <Combobox
            options={customerOptions}
            placeholder="Customer"
            emptyMessage="No customers found"
            value={customerSearch}
            onSelect={handleCustomerSelect}
            onSearch={setCustomerSearch}
            onSearchClear={() => setCustomerSearch("")}
            className="h-8 w-40"
          />
        </div>

        {/* Selected filters badges */}
        {(selectedTransactionTypes.length > 0 ||
          selectedVendorIds.length > 0 ||
          selectedCustomerIds.length > 0) && (
          <div className="flex flex-wrap gap-2 items-center">
            {selectedTransactionTypes.map((type) => {
              const label = TRANSACTION_TYPES.find((t) => t.value === type)?.label || type
              return (
                <Badge
                  key={type}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  <span className="text-xs">{label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveTransactionType(type)
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
            {selectedVendorIds.map((id) => {
              const vendor = vendorResponse?.data?.find((v) => v.id === id)
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    V: {vendor?.name || id}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveVendor(id)
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
            {selectedCustomerIds.map((id) => {
              const customer = customerResponse?.customers?.find((c) => c.id === id)
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  <span className="text-xs text-green-600 dark:text-green-400">
                    C: {customer?.name || id}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveCustomer(id)
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  title="Click to view transaction ledger"
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleClick(row.original.id)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <Card className="m-4">
                    <CardContent>
                      <NoDataFound
                        message="No Transaction found!"
                        details="Create a Transaction first."
                      />
                    </CardContent>
                  </Card>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && <DataTablePagination table={table} />}
      <DataTableBulkActions table={table} />
    </div>
  )
}

export default TransactionTable