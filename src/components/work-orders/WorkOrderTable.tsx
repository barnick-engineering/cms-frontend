import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import { DataTableViewOptions } from '@/features/users/components/data-table-view-options'
import { DataTablePagination } from '@/features/users/components/data-table-pagination'
import type { DataTablePropsInterface } from '@/interface/workOrderInterface'
import { NoDataFound } from '../NoDataFound'
import { Card, CardContent } from '../ui/card'

interface WorkOrderTableProps extends DataTablePropsInterface {}

const WorkOrderTable = ({
  data,
  pageIndex,
  pageSize,
  total,
  onPageChange,
}: WorkOrderTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize })
        onPageChange(newState.pageIndex)
      } else {
        onPageChange(updater.pageIndex)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const pageCount = table.getPageCount()

  useEffect(() => {
    if (table.getState().pagination.pageIndex >= pageCount && pageCount > 0) {
      table.setPageIndex(pageCount - 1)
    }
  }, [table, pageCount])

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-end'>
        <DataTableViewOptions table={table} />
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
                        details="Try adjusting your filters or create a work order."
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
