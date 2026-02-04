import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { WorkOrderColumns as columns } from './WorkOrderColumns'
import { Input } from '@/components/ui/input'
import type { ColumnFiltersState } from '@tanstack/react-table'
import { DataTableViewOptions } from '@/features/users/components/data-table-view-options'
import { DataTablePagination } from '@/features/users/components/data-table-pagination'
import type { DataTablePropsInterface } from '@/interface/workOrderInterface'
import { useDebounce } from '../../hooks/useDebounce'
import { NoDataFound } from '../NoDataFound'
import { Card, CardContent } from '../ui/card'

interface WorkOrderTableProps extends DataTablePropsInterface {}

const WorkOrderTable = ({
  data,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onSearchChange,
}: WorkOrderTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    onPageChange(0)
    onSearchChange?.(debouncedSearch || undefined)
  }, [debouncedSearch, onPageChange, onSearchChange])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize })
        onPageChange(newState.pageIndex)
      } else {
        onPageChange(updater.pageIndex)
      }
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      const id = String(row.getValue('id')).toLowerCase()
      const no = String(row.getValue('no') || '').toLowerCase()
      const customer = String(row.getValue('customer') || '').toLowerCase()
      const amount = String(row.getValue('amount') || '').toLowerCase()
      const date = String(row.getValue('date') || '').toLowerCase()
      const searchValue = String(filterValue).toLowerCase()
      return (
        id.includes(searchValue) ||
        no.includes(searchValue) ||
        customer.includes(searchValue) ||
        amount.includes(searchValue) ||
        date.includes(searchValue)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const pageCount = table.getPageCount()

  useEffect(() => {
    if (table.getState().pagination.pageIndex >= pageCount && pageCount > 0) {
      table.setPageIndex(pageCount - 1)
    }
  }, [table, pageCount])

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className="flex flex-1 flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center gap-x-2">
            <Input
              placeholder="Search by work order no, customer, amount, date..."
              value={searchInput}
              onChange={handleSearchInputChange}
              className="h-8 w-37.5 lg:w-62.5"
            />
          </div>
          <div className="flex items-center">
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  <Card className='m-4'>
                    <CardContent>
                      <NoDataFound
                        message='No Work Order found!'
                        details="Create a work order first."
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
    </div>
  )
}

export default WorkOrderTable
