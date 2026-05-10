import { useEffect, useMemo, useState } from 'react'
import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Combobox } from '@/components/ui/combobox'
import DateRangeSearch from '@/components/DateRangeSearch'
import { NoDataFound } from '@/components/NoDataFound'
import { DataTablePagination } from '@/features/users/components/data-table-pagination'
import { DataTableViewOptions } from '@/features/users/components/data-table-view-options'
import { loanForOptions } from '@/constance/loanConstance'
import type { Loan, LoanTableProps } from '@/interface/loanInterface'
import { useDebounce } from '@/hooks/useDebounce'
import { LoanColumns as columns } from './LoanColumns'
import LoanViewDrawer from './LoanViewDrawer'

const currency = (value: number | undefined) => `৳${Number(value || 0).toLocaleString('en-IN')}`

const LoanTable = ({
  data,
  summary,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onSearchChange,
  onLoanForFilterChange,
  onDateRangeChange,
  loanForFilter,
  dateRange,
}: LoanTableProps) => {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)

  const [currentRow, setCurrentRow] = useState<Loan | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const loanForFilterOptions = useMemo(
    () => [{ value: '__clear__', label: 'All Loan For' }, ...loanForOptions],
    []
  )

  useEffect(() => {
    onPageChange(0)
    onSearchChange?.(debouncedSearch || undefined)
  }, [debouncedSearch, onPageChange, onSearchChange])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
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
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="space-y-4 max-sm:has-[div[role='toolbar']]:mb-16">
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Loan</p>
            <p className="text-xl font-semibold">{currency(summary?.total_loan)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-xl font-semibold">{currency(summary?.total_paid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Remaining</p>
            <p className="text-xl font-semibold">{currency(summary?.total_remaining)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-1 flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center gap-x-2 flex-wrap">
          <DateRangeSearch value={dateRange} onDateChange={onDateRangeChange} />
          <Combobox
            options={loanForFilterOptions}
            value={loanForFilter || ''}
            onSelect={(val) =>
              onLoanForFilterChange?.(val === '__clear__' || !val ? undefined : val)
            }
            placeholder="Filter by Loan For"
            className="h-8 w-[160px] lg:w-[190px]"
          />
          <Input
            placeholder="Search loan_for, loan_from, amount, paid, remaining, remarks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-8 w-[170px] lg:w-[300px]"
          />
        </div>
        <DataTableViewOptions table={table} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setCurrentRow(row.original as Loan)
                    setDrawerOpen(true)
                  }}
                  data-state={row.getIsSelected() && 'selected'}
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Card className="m-4">
                    <CardContent>
                      <NoDataFound message="No loan found!" details="Create a loan first." />
                    </CardContent>
                  </Card>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && <DataTablePagination table={table} />}

      <LoanViewDrawer open={drawerOpen} onOpenChange={setDrawerOpen} currentRow={currentRow} />
    </div>
  )
}

export default LoanTable
