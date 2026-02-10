import { useState, Fragment } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Download } from 'lucide-react'
import { DataTablePagination } from '@/components/data-table-pagination'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import type {
  WorkOrderDetailsReportRow,
  WorkOrderDetailsReportItem,
  WorkOrderDetailsReportExpense,
} from '@/interface/reportV1Interface'

const formatCurrency = (n: number) => `৳${(n ?? 0).toLocaleString('en-IN')}`
const formatDate = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString() : '–'

const columns: ColumnDef<WorkOrderDetailsReportRow>[] = [
  {
    id: 'expand',
    header: '',
    cell: () => null,
  },
  {
    id: 'no',
    header: 'WO No',
    accessorFn: (row) => row.work_order.no,
  },
  {
    id: 'customer',
    header: 'Customer',
    accessorFn: (row) => row.work_order.customer,
  },
  {
    id: 'amount',
    header: 'Amount',
    accessorFn: (row) => row.work_order.amount,
    cell: ({ row }) => formatCurrency(row.original.work_order.amount),
  },
  {
    id: 'total_paid',
    header: 'Total Paid',
    accessorFn: (row) => row.work_order.total_paid,
    cell: ({ row }) => formatCurrency(row.original.work_order.total_paid),
  },
  {
    id: 'date',
    header: 'Date',
    accessorFn: (row) => row.work_order.date,
    cell: ({ row }) => formatDate(row.original.work_order.date),
  },
  {
    id: 'delivery',
    header: 'Delivery',
    cell: ({ row }) => {
      const wo = row.original.work_order
      return (
        <span className="text-muted-foreground text-sm">
          {wo.is_delivered ? 'Yes' : 'No'}
          {wo.delivery_charge > 0 && ` · ৳${wo.delivery_charge.toLocaleString('en-IN')}`}
        </span>
      )
    },
  },
  {
    accessorKey: 'total_expense',
    header: 'Total Expense',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: 'net_profit',
    header: 'Net Profit',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
]

function ItemsTable({ items }: { items: WorkOrderDetailsReportItem[] }) {
  if (!items?.length) return <p className="text-sm text-muted-foreground">No items</p>
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Details</TableHead>
          <TableHead className="text-right">Total Order</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((i) => (
          <TableRow key={i.id}>
            <TableCell className="font-medium">{i.item}</TableCell>
            <TableCell className="text-muted-foreground">{i.details ?? '–'}</TableCell>
            <TableCell className="text-right">{Number(i.total_order).toLocaleString('en-IN')}</TableCell>
            <TableCell className="text-right">{formatCurrency(i.unit_price)}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(i.total_order * i.unit_price)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ExpensesTable({ expenses }: { expenses: WorkOrderDetailsReportExpense[] }) {
  if (!expenses?.length) return <p className="text-sm text-muted-foreground">No expenses</p>
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Purpose</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Expense Date</TableHead>
          <TableHead>Paid By</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((e) => (
          <TableRow key={e.id}>
            <TableCell className="font-medium">{e.no}</TableCell>
            <TableCell>{e.purpose}</TableCell>
            <TableCell className="text-right">{formatCurrency(e.amount)}</TableCell>
            <TableCell className="text-muted-foreground max-w-[200px] truncate" title={e.details ?? undefined}>
              {e.details ?? '–'}
            </TableCell>
            <TableCell>{formatDate(e.expense_date)}</TableCell>
            <TableCell className="text-muted-foreground text-sm">{e.paid_by}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

interface WorkOrderDetailsReportTableProps {
  data: WorkOrderDetailsReportRow[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  title?: string
  onDownloadPdf?: () => void
  onDownloadExcel?: () => void
}

export function WorkOrderDetailsReportTable({
  data,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  title = 'Work Order Details Report',
  onDownloadPdf,
  onDownloadExcel,
}: WorkOrderDetailsReportTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater
      onPageChange(next.pageIndex)
    },
  })

  const rows = table.getRowModel().rows

  return (
    <div className="space-y-4 mt-5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          {onDownloadExcel && (
            <Button variant="outline" size="sm" onClick={onDownloadExcel}>
              Download as Excel
            </Button>
          )}
          {onDownloadPdf && (
            <Button variant="outline" size="sm" onClick={onDownloadPdf} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.column.id === 'expand' ? '' : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const wo = row.original.work_order
              const isExpanded = expandedId === wo.id
              return (
                <Fragment key={row.id}>
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedId(isExpanded ? null : wo.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} onClick={cell.column.id === 'expand' ? undefined : () => {}}>
                        {cell.column.id === 'expand' ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedId(isExpanded ? null : wo.id)
                            }}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${row.id}-detail`} className="bg-muted/30">
                      <TableCell colSpan={columns.length} className="p-4 align-top">
                        <div className="space-y-6 pl-6">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Work order</h4>
                            <p className="text-sm text-muted-foreground">
                              Delivered: {wo.is_delivered ? 'Yes' : 'No'}
                              {wo.delivery_charge > 0 && ` · Delivery charge: ${formatCurrency(wo.delivery_charge)}`}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Items</h4>
                            <div className="rounded-md border">
                              <ItemsTable items={row.original.items} />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Expenses</h4>
                            <div className="rounded-md border">
                              <ExpensesTable expenses={row.original.expenses} />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && <DataTablePagination table={table} />}
    </div>
  )
}
