import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useProjectById } from '@/hooks/useProject'
import { useWorkOrderList } from '@/hooks/useWorkOrder'
import { getPaymentStatus } from '@/lib/workOrderPaymentStatus'
import ProjectMutateDialog from '@/components/projects/ProjectMutateDialog'
import { DataTablePagination } from '@/features/users/components/data-table-pagination'
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import type { ProjectWorkOrderItem } from '@/interface/projectInterface'

const PAGE_SIZE = 10

function formatCurrency(value: number | undefined) {
  if (value == null) return '৳0'
  return `৳${value.toLocaleString('en-IN')}`
}

function SummaryCard({
  label,
  value,
  isLoading,
  accent,
}: {
  label: string
  value: string
  isLoading?: boolean
  accent?: 'green' | 'red' | 'amber'
}) {
  const accentClass =
    accent === 'green'
      ? 'text-green-600 dark:text-green-400'
      : accent === 'red'
        ? 'text-orange-600 dark:text-orange-400'
        : accent === 'amber'
          ? 'text-amber-600 dark:text-amber-400'
          : ''

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <p className={`text-xl font-bold tabular-nums ${accentClass}`}>{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

const woColumns: ColumnDef<ProjectWorkOrderItem>[] = [
  {
    accessorKey: 'no',
    header: 'WO No',
    cell: ({ row }) => (
      <Link
        to={`/work-orders/${row.original.id}`}
        className="font-medium text-primary hover:underline whitespace-nowrap"
      >
        {row.original.no || 'N/A'}
      </Link>
    ),
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => row.original.customer || '—',
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) =>
      row.original.date ? new Date(row.original.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    id: 'paid',
    header: 'Paid',
    cell: ({ row }) => (
      <span className="text-green-600 dark:text-green-400 font-medium">
        {formatCurrency(row.original.total_paid)}
      </span>
    ),
  },
  {
    id: 'pending',
    header: 'Pending',
    cell: ({ row }) => {
      const pending = Math.max(0, row.original.amount - row.original.total_paid)
      return (
        <span className={pending > 0 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
          {formatCurrency(pending)}
        </span>
      )
    },
  },
  {
    id: 'expense',
    header: 'Expense',
    cell: ({ row }) => (
      <span className="text-amber-600 dark:text-amber-400 font-medium">
        {formatCurrency(row.original.total_expense)}
      </span>
    ),
  },
  {
    id: 'net',
    header: 'Net',
    cell: ({ row }) => {
      const amount = row.original.amount || 0
      const expense = row.original.total_expense || 0
      const net = amount - expense
      const pct = expense > 0 ? (net / expense) * 100 : null
      return (
        <span>
          {formatCurrency(net)}
          {pct !== null && (
            <span className="text-muted-foreground text-xs ml-1">
              ({pct.toFixed(1)}%)
            </span>
          )}
        </span>
      )
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = getPaymentStatus(row.original.amount, row.original.total_paid, row.original.is_paid)
      const variant = status === 'paid' ? 'default' : status === 'partial' ? 'secondary' : 'outline'
      const label = status === 'paid' ? 'Paid' : status === 'partial' ? 'Partial' : 'Pending'
      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    id: 'delivered',
    header: 'Delivered',
    cell: ({ row }) => (
      <Badge variant={row.original.is_delivered ? 'default' : 'outline'}>
        {row.original.is_delivered ? 'Yes' : 'No'}
      </Badge>
    ),
  },
]

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [editOpen, setEditOpen] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)

  const { data: project, isLoading, isError } = useProjectById(id ?? '', { enabled: !!id })

  const listParams = useMemo(
    () => ({
      project_id: id ? Number(id) : undefined,
      limit: PAGE_SIZE,
      offset: pageIndex * PAGE_SIZE,
    }),
    [id, pageIndex]
  )

  const { data: woData, isLoading: woLoading } = useWorkOrderList(listParams, { enabled: !!id })

  const workOrders = woData?.data ?? []
  const woTotal = woData?.total ?? 0

  const handlePageChange = useCallback((index: number) => setPageIndex(index), [])

  const table = useReactTable({
    data: workOrders as unknown as ProjectWorkOrderItem[],
    columns: woColumns,
    state: { pagination: { pageIndex, pageSize: PAGE_SIZE } },
    manualPagination: true,
    pageCount: Math.ceil(woTotal / PAGE_SIZE),
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize: PAGE_SIZE })
        handlePageChange(newState.pageIndex)
      } else {
        handlePageChange(updater.pageIndex)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (!id) {
    return (
      <Main>
        <p className="text-destructive">Invalid project.</p>
        <Button variant="link" asChild>
          <Link to="/projects">Back to Projects</Link>
        </Button>
      </Main>
    )
  }

  if (isError || (!isLoading && !project)) {
    return (
      <Main>
        <p className="text-destructive">Project not found.</p>
        <Button variant="link" asChild>
          <Link to="/projects">Back to Projects</Link>
        </Button>
      </Main>
    )
  }

  return (
    <Main>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/projects" aria-label="Back to projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            {isLoading ? (
              <Skeleton className="h-7 w-48" />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight">{project?.name}</h1>
            )}
            {project?.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
          disabled={isLoading || !project}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-6">
        <SummaryCard
          label="Total Orders"
          value={String(project?.total_orders ?? 0)}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Total Amount"
          value={formatCurrency(project?.total_amount)}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Total Paid"
          value={formatCurrency(project?.total_paid)}
          isLoading={isLoading}
          accent="green"
        />
        <SummaryCard
          label="Total Pending"
          value={formatCurrency(project?.total_pending)}
          isLoading={isLoading}
          accent="red"
        />
        <SummaryCard
          label="Total Expense"
          value={formatCurrency(project?.total_expense)}
          isLoading={isLoading}
          accent="amber"
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Work Orders</h2>

        {woLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((h) => (
                        <TableHead key={h.id}>
                          {h.isPlaceholder ? null : typeof h.column.columnDef.header === 'string'
                            ? h.column.columnDef.header
                            : null}
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
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          const wo = row.original as ProjectWorkOrderItem
                          window.location.href = `/work-orders/${wo.id}`
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {typeof cell.column.columnDef.cell === 'function'
                              ? cell.column.columnDef.cell(cell.getContext())
                              : null}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={woColumns.length} className="h-24 text-center text-muted-foreground">
                        No work orders in this project.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {workOrders.length > 0 && <DataTablePagination table={table} />}
          </div>
        )}
      </div>

      {project && (
        <ProjectMutateDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          currentRow={project}
        />
      )}
    </Main>
  )
}

export default ProjectDetail
