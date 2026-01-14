import { useEffect, useState } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
    type VisibilityState,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTableViewOptions } from '@/features/users/components/data-table-view-options'
import { Card, CardContent } from '../ui/card'
import { NoDataFound } from '../NoDataFound'
import { Button } from '../ui/button'
import { Download } from 'lucide-react'
import { TransactionLedgerDataTablePagination } from '../customers/TransactionLedgerDataTablePagination'
// import { generateLedgerExcel } from '@/utils/enums/customerOrVendorLedgerExcel'

interface ReportTableProps<TData> {
    data: TData[]
    pageIndex: number
    pageSize: number
    total: number
    columns: ColumnDef<TData>[]
    onPageChange: (page: number) => void
    onDownloadPdf: () => void
    onDownloadExcel?: () => void
    entityName?: string
    title?: string
}

export const ReportTable = <TData,>({
    data,
    pageIndex,
    pageSize,
    total,
    columns,
    onPageChange,
    onDownloadPdf,
    onDownloadExcel,
    // entityName,
    title = 'Ledger Details',
}: ReportTableProps<TData>) => {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            pagination: { pageIndex, pageSize },
        },
        manualPagination: true,
        pageCount: Math.ceil(total / pageSize),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
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
        getPaginationRowModel: getPaginationRowModel(),
    })

    const pageCount = table.getPageCount()

    useEffect(() => {
        if (table.getState().pagination.pageIndex >= pageCount && pageCount > 0) {
            table.setPageIndex(pageCount - 1)
        }
    }, [table, pageCount])

    return (
        <div className="space-y-4 mt-5">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">{title}</h2>
                </div>
                <div className='flex flex-col md:items-center gap-2'>
                    {onDownloadExcel && (
                        <Button onClick={onDownloadExcel}>
                            Download as Excel
                        </Button>
                    )}

                    <Button onClick={onDownloadPdf} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </div>

            <div className="flex justify-end mb-2">
                <DataTableViewOptions table={table} />
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
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
                                            <NoDataFound
                                                message="No transaction details found!"
                                                details="Try selecting a customer or vendor."
                                            />
                                        </CardContent>
                                    </Card>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {data.length > 0 && <TransactionLedgerDataTablePagination table={table} />}
        </div>
    )
}