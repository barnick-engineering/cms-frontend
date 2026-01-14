import { useEffect, useState } from "react"
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Input } from "@/components/ui/input"

import type { VendorTransactionInterface } from "@/interface/vendorInterface"
import { VendorTransactionColumns } from "./VendorTransactionColumns"
import { DataTableViewOptions } from "../customers/DataTableViewActions"
import { DataTablePagination } from "../data-table-pagination"
import DateRangeSearch from "../DateRangeSearch"

interface VendorTransactionTableProps {
  data: VendorTransactionInterface[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (pageIndex: number) => void
}

const VendorTransactionsTable = ({
  data,
  pageIndex,
  pageSize,
  total,
  onPageChange,
}: VendorTransactionTableProps) => {
  // Properly typed states
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns: VendorTransactionColumns,
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
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize })
        onPageChange(newState.pageIndex)
      } else {
        onPageChange(updater.pageIndex)
      }
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      return (
        row.original.no.toLowerCase().includes(searchValue) ||
        row.original.transactionType.toLowerCase().includes(searchValue) ||
        row.original.transactionStatus.toLowerCase().includes(searchValue)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const pageCount = table.getPageCount()

  useEffect(() => {
    if (table.getState().pagination.pageIndex >= pageCount) table.setPageIndex(pageCount - 1)
  }, [table, pageCount])

  return (
    <div className="space-y-4">
      {/* <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by No, Type, Status..."
          value={table.getState().globalFilter ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-8 w-[200px] lg:w-[300px]"
        />
        <DataTableViewOptions table={table} />
      </div> */}
      <div className="flex flex-1 flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <DataTableViewOptions table={table} />
        </div>

        <div className="flex items-center gap-x-2">
          <DateRangeSearch
          //  onDateChange={handleDateChange} 
          />
        </div>
        {/* <Input
                placeholder="Filter by No, Type, Status..."
                value={table.getState().globalFilter ?? ""}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
                className="h-8 w-[200px] lg:w-[300px]"
              /> */}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={VendorTransactionColumns.length} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}

export default VendorTransactionsTable