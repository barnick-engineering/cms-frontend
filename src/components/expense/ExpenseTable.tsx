import { useEffect, useState, useMemo } from 'react'
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
import { Combobox } from '@/components/ui/combobox'

import { ExpenseColumns as columns } from './ExpenseColumns'
import { ExpenseTableBulkActions } from './ExpenseTableBulkActions'
import ExpenseViewDrawer from './ExpenseViewDrawer'

import { DataTableViewOptions } from '@/features/users/components/data-table-view-options'
import { DataTablePagination } from '@/features/users/components/data-table-pagination'
import { NoDataFound } from '../NoDataFound'

import type { ExpenseTableProps } from '@/interface/expenseInterface'

import { useDebounce } from '@/hooks/useDebounce'
import type { Expense } from '@/interface/expenseInterface'
import { useCustomerList } from '@/hooks/useCustomer'
import { useWorkOrderList } from '@/hooks/useWorkOrder'
import { expensePurposes } from '@/constance/expenseConstance'

const ExpenseTable = ({
    data,
    pageIndex,
    pageSize,
    total,
    onPageChange,
    onSearchChange,
    onCustomerFilterChange,
    onWorkOrderFilterChange,
    onPurposeFilterChange,
    customerFilter,
    workOrderFilter,
    purposeFilter,
}: ExpenseTableProps) => {
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
    const [currentRow, setCurrentRow] = useState<Expense | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    /* -------------------- filter search states -------------------- */
    const [customerSearch, setCustomerSearch] = useState("")
    const [workOrderSearch, setWorkOrderSearch] = useState("")

    /* -------------------- fetch filter data -------------------- */
    // Fetch customers for filter combobox with search
    const { data: customersData, isLoading: customersLoading } = useCustomerList(customerSearch || undefined, 100, 0)
    const customerOptions = useMemo(() => {
        const options = (customersData?.data || []).map((customer) => ({
            value: String(customer.id),
            label: customer.name,
        }))
        // Add "Clear" option at the beginning
        return [{ value: "__clear__", label: "All Customers" }, ...options]
    }, [customersData])

    // Fetch work orders for filter combobox with search
    const { data: workOrdersData, isLoading: workOrdersLoading } = useWorkOrderList(workOrderSearch || undefined, 100, 0)
    const workOrderOptions = useMemo(() => {
        const options = (workOrdersData?.data || []).map((workOrder) => ({
            value: String(workOrder.id),
            label: workOrder.no,
        }))
        // Add "Clear" option at the beginning
        return [{ value: "__clear__", label: "All Work Orders" }, ...options]
    }, [workOrdersData])

    // Purpose options from constants
    const purposeOptions = useMemo(() => {
        const options = expensePurposes.map((purpose) => ({
            value: purpose.value,
            label: purpose.label,
        }))
        // Add "Clear" option at the beginning
        return [{ value: "__clear__", label: "All Purposes" }, ...options]
    }, [])

    /* -------------------- search effect -------------------- */
    useEffect(() => {
        onPageChange(0)
        onSearchChange?.(debouncedSearch || undefined)
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
            const id = String(row.getValue('id')).toLowerCase()
            const no = String(row.getValue('no') || '').toLowerCase()
            const workorder = String(row.getValue('workorder') || '').toLowerCase()
            const purpose = String(row.getValue('purpose') || '').toLowerCase()
            const details = String(row.getValue('details') || '').toLowerCase()
            const searchValue = String(filterValue).toLowerCase()

            return (
                id.includes(searchValue) ||
                no.includes(searchValue) ||
                workorder.includes(searchValue) ||
                purpose.includes(searchValue) ||
                details.includes(searchValue)
            )
        },
    })

    const pageCount = table.getPageCount()

    /* -------------------- safety pagination -------------------- */
    useEffect(() => {
        if (table.getState().pagination.pageIndex >= pageCount && pageCount > 0) {
            table.setPageIndex(pageCount - 1)
        }
    }, [table, pageCount])

    return (
        <div className="space-y-4 max-sm:has-[div[role='toolbar']]:mb-16">
            {/* Toolbar */}
            <div className="flex flex-1 flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 md:flex-row md:items-center gap-x-2 flex-wrap">
                    {/* Customer Filter */}
                    <Combobox
                        options={customerOptions}
                        value={customerFilter ? String(customerFilter) : ""}
                        onSelect={(val) => {
                            if (val === "__clear__" || !val) {
                                onCustomerFilterChange?.(undefined)
                            } else {
                                onCustomerFilterChange?.(val)
                            }
                        }}
                        onSearch={setCustomerSearch}
                        loading={customersLoading}
                        placeholder="Filter by Customer"
                        className="h-8 w-[150px] lg:w-[180px]"
                    />

                    {/* Work Order Filter */}
                    <Combobox
                        options={workOrderOptions}
                        value={workOrderFilter ? String(workOrderFilter) : ""}
                        onSelect={(val) => {
                            if (val === "__clear__" || !val) {
                                onWorkOrderFilterChange?.(undefined)
                            } else {
                                onWorkOrderFilterChange?.(val)
                            }
                        }}
                        onSearch={setWorkOrderSearch}
                        loading={workOrdersLoading}
                        placeholder="Filter by Work Order"
                        className="h-8 w-[150px] lg:w-[180px]"
                    />

                    {/* Purpose Filter */}
                    <Combobox
                        options={purposeOptions}
                        value={purposeFilter || ""}
                        onSelect={(val) => {
                            if (val === "__clear__" || !val) {
                                onPurposeFilterChange?.(undefined)
                            } else {
                                onPurposeFilterChange?.(val)
                            }
                        }}
                        placeholder="Filter by Purpose"
                        className="h-8 w-[150px] lg:w-[180px]"
                    />

                    {/* Search Field */}
                    <Input
                        placeholder="Search by expense no, details, remarks, amount, date, paid by..."
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
                                        setCurrentRow(row.original as Expense)
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
