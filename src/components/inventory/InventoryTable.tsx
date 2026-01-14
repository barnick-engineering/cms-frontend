import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { InventoryColumns as columns } from './InventoryColumns'
import { Input } from '@/components/ui/input'
import { InventoryTableBulkActions } from './InventoryTableBulkActions'
import { DataTableViewOptions } from '@/features/users/components/data-table-view-options'
import { DataTablePagination } from '@/features/users/components/data-table-pagination'
import InventoryViewDrawer from './InventoryViewDrawer'
import type { InventoryTableProps, InventoryListItem } from '@/interface/inventoryInterface'
import { useDebounce } from '@/hooks/useDebounce'
import DateRangeSearch from '../DateRangeSearch'
import { NoDataFound } from '../NoDataFound'
import { Card, CardContent } from '../ui/card'

const InventoryTable = ({
  data,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onSearchChange,
  onDateChange,
}: InventoryTableProps & {
  onDateChange?: (from?: Date, to?: Date) => void
}) => {
  // Table states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Search state
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)

  // Drawer state
  const [currentRow, setCurrentRow] = useState<InventoryListItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Trigger debounced search
  useEffect(() => {
    onPageChange(0)
    onSearchChange?.(debouncedSearch)
  }, [debouncedSearch, onPageChange, onSearchChange])

  // Table setup
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
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: updater => {
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
    globalFilterFn: (row, _columnId, filterValue) => {
      const id = String(row.index + 1).toLowerCase()
      const name = String(row.getValue('name')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()
      return id.includes(searchValue) || name.includes(searchValue)
    },
  })

  const pageCount = table.getPageCount()

  // Prevent going beyond last page
  useEffect(() => {
    if (table.getState().pagination.pageIndex >= pageCount) {
      table.setPageIndex(pageCount - 1)
    }
  }, [table, pageCount])

  return (
    <div className="space-y-4 max-sm:has-[div[role='toolbar']]:mb-16">
      {/* Top Toolbar */}
      <div className="flex flex-1 flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center gap-x-2">
          <DateRangeSearch onDateChange={onDateChange} />
          <Input
            placeholder="Search inventory..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        </div>

        <div className="flex items-center">
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
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
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  onClick={() => {
                    setCurrentRow(row.original)
                    setDrawerOpen(true)
                  }}
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Card className='m-4'>
                    <CardContent>
                      <NoDataFound
                        message='No Inventory found!'
                        details="Create a Inventory first."
                      />
                    </CardContent>
                  </Card>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.length > 0 && <DataTablePagination table={table} />}

      {/* Bulk Actions */}
      <InventoryTableBulkActions table={table} />

      {/* Drawer */}
      <InventoryViewDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        currentRow={currentRow}
      />
    </div>
  )
}

export default InventoryTable