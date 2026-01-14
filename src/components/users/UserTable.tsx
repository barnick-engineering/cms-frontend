import { useState, useEffect } from 'react'
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
import { usersColumns as columns } from './UserColumns'
import { Input } from '@/components/ui/input'
import { DataTablePagination } from '../data-table-pagination'
import { DataTableBulkActions } from './DataTableBulkActions'
import { DataTableViewOptions } from '@/features/users/components/data-table-view-options'
import type { UserListItem } from '@/interface/userInterface'
import { useDebounce } from '@/hooks/useDebounce'
import { Card, CardContent } from '../ui/card'
import { NoDataFound } from '../NoDataFound'

type UsersTableProps = {
    data: UserListItem[]
    pageIndex: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onSearchChange?: (searchBy?: string) => void
}

export function UsersTable({
    data,
    pageIndex,
    pageSize,
    total,
    onPageChange,
    onSearchChange,
}: UsersTableProps) {
    const [rowSelection, setRowSelection] = useState({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // Search state
    const [searchInput, setSearchInput] = useState('')
    const debouncedSearch = useDebounce(searchInput, 300)

    // Trigger search callback on input change
    useEffect(() => {
        onPageChange(0) // Reset to first page
        onSearchChange?.(debouncedSearch)
    }, [debouncedSearch, onPageChange, onSearchChange])

    const table = useReactTable<UserListItem>({
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

    const pageCount = table.getPageCount()

    useEffect(() => {
        if (table.getState().pagination.pageIndex >= pageCount && pageCount > 0) {
            table.setPageIndex(pageCount - 1)
        }
    }, [table, pageCount])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-1 flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-x-2">
                        <Input
                            placeholder="Filter by id, name, phone..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="h-8 w-[150px] lg:w-[250px]"
                        />
                    </div>

                    <div className="flex items-center">
                        <DataTableViewOptions table={table} />
                    </div>
                </div>
            </div>

            <div className="rounded-md border">
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
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <Card className='m-4'>
                                        <CardContent>
                                            <NoDataFound
                                                message='No User found!'
                                                details="Create a user first."
                                            />
                                        </CardContent>
                                    </Card>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination table={table} />
            <DataTableBulkActions table={table} />
        </div>
    )
}