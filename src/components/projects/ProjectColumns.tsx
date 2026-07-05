import { Link, useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '../customers/DataTableColumnHeader'
import type { Project } from '@/interface/projectInterface'
import { useProjects } from './project-provider'

function formatCurrency(value: number | undefined) {
  if (value == null) return '৳0'
  return `৳${value.toLocaleString('en-IN')}`
}

function ProjectRowActions({ project }: { project: Project }) {
  const navigate = useNavigate()
  const { setOpen, setCurrentRow } = useProjects()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          onClick={(e) => e.stopPropagation()}
          className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/projects/${project.id}`)
          }}
        >
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            setCurrentRow(project)
            setOpen('edit')
          }}
        >
          Edit
          <DropdownMenuShortcut>
            <Pencil size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            setCurrentRow(project)
            setOpen('delete')
          }}
        >
          Delete
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const ProjectColumns: ColumnDef<Project>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const project = row.original
      return (
        <Link
          to={`/projects/${project.id}`}
          className="font-medium text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {project.name}
        </Link>
      )
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => {
      const desc = row.getValue<string | null>('description')
      return <span className="text-muted-foreground">{desc || '—'}</span>
    },
  },
  {
    accessorKey: 'total_orders',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Orders" />,
    cell: ({ row }) => row.original.total_orders ?? 0,
  },
  {
    accessorKey: 'total_amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => formatCurrency(row.original.total_amount),
  },
  {
    accessorKey: 'total_paid',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Paid" />,
    cell: ({ row }) => (
      <span className="text-green-600 dark:text-green-400 font-medium">
        {formatCurrency(row.original.total_paid)}
      </span>
    ),
  },
  {
    accessorKey: 'total_pending',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Pending" />,
    cell: ({ row }) => {
      const pending = row.original.total_pending ?? 0
      return (
        <span className={pending > 0 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
          {formatCurrency(pending)}
        </span>
      )
    },
  },
  {
    accessorKey: 'total_expense',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Expense" />,
    cell: ({ row }) => (
      <span className="text-amber-600 dark:text-amber-400 font-medium">
        {formatCurrency(row.original.total_expense)}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <ProjectRowActions project={row.original} />,
  },
]
