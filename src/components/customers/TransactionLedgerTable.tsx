import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnFiltersState,
    type SortingState,
    type ColumnDef,
} from "@tanstack/react-table"
import type { TransactionLedgerInterface, Transaction } from "@/interface/transactionInterface"
import { Input } from "../ui/input"
import { DataTableViewOptions } from "@/features/users/components/data-table-view-options"
import type { TransactionLedgerTableProps } from "@/interface/transactionInterface"
import { NoDataFound } from "../NoDataFound"
import DateRangeSearch from "../DateRangeSearch"
import { Card, CardContent } from "../ui/card"
import { TransactionLedgerDataTablePagination } from "./TransactionLedgerDataTablePagination"
import { Badge } from "../ui/badge"
import { DetailsRow } from "./DetailsRow"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { ChevronDown, Download, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { useShopStore } from "@/stores/shopStore"
import { generateTransactionDetailsPDF } from "@/utils/enums/transactionDetailsPdf"
import { toast } from "sonner"

const TransactionLedgerTable = ({
    data,
    pageIndex,
    pageSize,
    total,
    onPageChange,
    onDateChange,
    initialDateRange,
}: TransactionLedgerTableProps) => {
    const navigate = useNavigate()
    const { currentShopName } = useShopStore()
    const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())
    
    // Properly typed states
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
    const [globalFilter, setGlobalFilter] = useState("")
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    const handleDownload = async (e: React.MouseEvent, transaction: TransactionLedgerInterface) => {
        e.stopPropagation()

        if (!currentShopName) {
            toast.error('Shop name is missing')
            return
        }

        try {
            setDownloadingIds(prev => new Set(prev).add(transaction.id))
            
            // Convert TransactionLedgerInterface to Transaction format
            // Note: TransactionLedgerInterface has vendor field but partnerType indicates actual type
            const isVendor = transaction.partnerType === "VENDOR" || transaction.partnerType === "vendor"
            const transactionForPdf: Transaction = {
                no: transaction.no,
                id: transaction.id,
                partnerType: (isVendor ? "VENDOR" : "CUSTOMER") as "VENDOR" | "CUSTOMER",
                vendor: isVendor ? transaction.vendor : undefined,
                customer: !isVendor ? { id: transaction.vendor.id, name: transaction.vendor.name } : undefined,
                vendorId: isVendor ? transaction.vendorId : undefined,
                customerId: !isVendor ? transaction.vendorId : undefined,
                transactionType: transaction.transactionType as Transaction["transactionType"],
                transactionStatus: transaction.transactionStatus,
                totalAmount: transaction.totalAmount,
                paid: transaction.paid,
                pending: transaction.pending,
                paymentType: transaction.paymentType as Transaction["paymentType"],
                isPaid: transaction.isPaid,
                remarks: transaction.remarks,
                payable: transaction.payable,
                receivable: transaction.receivable,
                shopId: transaction.shopId,
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt,
                details: transaction.details || []
            }

            generateTransactionDetailsPDF(transactionForPdf, currentShopName)
            toast.success('Transaction report downloaded successfully')
        } catch (error) {
            console.error('Download error:', error)
            toast.error('Failed to download transaction report. Please try again.')
        } finally {
            setDownloadingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(transaction.id)
                return newSet
            })
        }
    }

    // Create a minimal column definition for table functionality (sorting, filtering, pagination)
    const columns: ColumnDef<TransactionLedgerInterface>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
        },
    ]

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
            <div className="flex flex-1 flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-x-2">
                    <DateRangeSearch
                        value={initialDateRange ? { from: initialDateRange.from, to: initialDateRange.to } : undefined}
                        onDateChange={onDateChange}
                    />
                    <Input
                        placeholder="Filter by id, name, phone or address..."
                        // value={searchInput}
                        // onChange={(e) => setSearchInput(e.target.value)}
                        className="h-8 w-37.5 lg:w-62.5"
                    />
                </div>

                <div className="flex items-center">
                    <DataTableViewOptions table={table} />
                </div>
            </div>

            <div className="rounded-md border">
                {data.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead className="w-[140px]">ID</TableHead>
                                <TableHead className="w-[100px]">Type</TableHead>
                                <TableHead className="min-w-[200px]">Remarks</TableHead>
                                <TableHead className="w-[100px] text-right">Amount</TableHead>
                                <TableHead className="w-[100px] text-right">Paid</TableHead>
                                <TableHead className="w-[100px] text-right">Pending</TableHead>
                                <TableHead className="w-[100px] text-right">Date</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => {
                                const transaction = row.original
                                const hasDetails = transaction.details && transaction.details.length > 0
                                const isExpanded = expandedRows.has(transaction.id)
                                
                                const toggleRow = () => {
                                    if (!hasDetails) return
                                    setExpandedRows(prev => {
                                        const newSet = new Set(prev)
                                        if (newSet.has(transaction.id)) {
                                            newSet.delete(transaction.id)
                                        } else {
                                            newSet.add(transaction.id)
                                        }
                                        return newSet
                                    })
                                }
                                
                                return (
                                    <>
                                        <TableRow 
                                            key={transaction.id}
                                            className="group hover:bg-muted/50 cursor-pointer"
                                            onClick={toggleRow}
                                        >
                                            <TableCell className="w-[50px]">
                                                {hasDetails ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            toggleRow()
                                                        }}
                                                        className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent transition-colors"
                                                    >
                                                        <ChevronDown 
                                                            className={`h-5 w-5 text-primary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                        />
                                                    </button>
                                                ) : (
                                                    <div className="h-8 w-8"></div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        navigate(`/transactions/${transaction.id}`)
                                                    }}
                                                    className="text-primary hover:underline font-medium"
                                                >
                                                    {transaction.no}
                                                </button>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        transaction.transactionType === 'COMMISSION'
                                                            ? 'default'
                                                            : transaction.transactionType === 'PAYMENT'
                                                                ? 'secondary'
                                                                : 'outline'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {transaction.transactionType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-[200px] truncate" title={transaction.remarks || 'N/A'}>
                                                    {transaction.remarks || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {Number(transaction.totalAmount ?? 0).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-green-600">
                                                {transaction.paid.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-orange-600">
                                                {transaction.pending.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="text-sm">
                                                    <div>{new Date(transaction.createdAt).toLocaleDateString('en-GB')}</div>
                                                    <div className="text-muted-foreground text-xs">
                                                        {new Date(transaction.createdAt).toLocaleTimeString('en-GB', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: false,
                                                        })}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={(e) => handleDownload(e, transaction)}
                                                                disabled={downloadingIds.has(transaction.id)}
                                                                className="p-1.5 hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                aria-label="Download transaction report"
                                                            >
                                                                {downloadingIds.has(transaction.id) ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Download className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Download PDF</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                        {hasDetails && isExpanded && (
                                            <TableRow>
                                                <TableCell colSpan={9} className="p-0 bg-muted/30">
                                                    <div className="px-6 py-4">
                                                        <DetailsRow row={transaction} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                )
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="h-64 flex items-center justify-center">
                        <Card className="w-full p-4">
                            <CardContent>
                                <NoDataFound
                                    message="No Transactions Yet"
                                    details="You haven't recorded any transactions. Create a transaction to get started."
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {data.length > 0 && <TransactionLedgerDataTablePagination table={table} />}
        </div>
    )
}

export default TransactionLedgerTable