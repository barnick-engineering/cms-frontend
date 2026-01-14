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

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

import { ExpenseColumns as columns } from './ExpenseColumns'
import { ExpenseTableBulkActions } from './ExpenseTableBulkActions'
import ExpenseViewDrawer from './ExpenseViewDrawer'

import { DataTableViewOptions } from '@/features/users/components/data-table-view-options'
import { DataTablePagination } from '@/features/users/components/data-table-pagination'
import DateRangeSearch from '../DateRangeSearch'
import { NoDataFound } from '../NoDataFound'

import type {
    ExpenseItemInterface,
    // ExpenseListItem,
    ExpenseTableProps,
} from '@/interface/expenseInterface'

import { useDebounce } from '@/hooks/useDebounce'
import { useShopStore } from '@/stores/shopStore'

const ExpenseTable = ({
    data,
    pageIndex,
    pageSize,
    total,
    onPageChange,
    onSearchChange,
    onDateChange,
}: ExpenseTableProps & {
    onDateChange?: (from?: Date, to?: Date) => void
}) => {
    const shopId = useShopStore(s => s.currentShopId)

    /* -------------------- table state -------------------- */
    const [rowSelection, setRowSelection] = useState({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    /* -------------------- search -------------------- */
    const [searchInput, setSearchInput] = useState('')
    const debouncedSearch = useDebounce(searchInput, 300)

    /* -------------------- drawer -------------------- */
    const [currentRow, setCurrentRow] = useState<ExpenseItemInterface | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    /* -------------------- search effect -------------------- */
    useEffect(() => {
        onPageChange(0)
        onSearchChange?.(debouncedSearch)
    }, [debouncedSearch, onPageChange, onSearchChange])

    /* -------------------- table -------------------- */
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
            const title = String(row.getValue('title')).toLowerCase()
            const searchValue = String(filterValue).toLowerCase()

            return id.includes(searchValue) || title.includes(searchValue)
        },
    })

    const pageCount = table.getPageCount()

    /* -------------------- safety pagination -------------------- */
    useEffect(() => {
        if (table.getState().pagination.pageIndex >= pageCount) {
            table.setPageIndex(pageCount - 1)
        }
    }, [table, pageCount])

    return (
        <div className="space-y-4 max-sm:has-[div[role='toolbar']]:mb-16">
            {/* Toolbar */}
            <div className="flex flex-1 flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 md:flex-row md:items-center gap-x-2">
                    <DateRangeSearch onDateChange={onDateChange} />
                    <Input
                        placeholder="Search expense..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                </div>

                <DataTableViewOptions table={table} />
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
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
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (!shopId) return
                                        setCurrentRow({
                                            ...row.original,
                                            shopId,
                                            remarks: row.original.remarks || '',
                                        })
                                        setDrawerOpen(true)
                                    }}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <Card className="m-4">
                                        <CardContent>
                                            <NoDataFound
                                                message="No expense found!"
                                                details="Create an expense first."
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

            {/* Bulk actions */}
            <ExpenseTableBulkActions table={table} />

            {/* Drawer */}
            <ExpenseViewDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                currentRow={currentRow}
            />
        </div>
    )
}

export default ExpenseTable