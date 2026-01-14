import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, DollarSign, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWorkOrders } from './work-order-provider'
import type { WorkOrder } from '@/interface/workOrderInterface'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const workOrder = row.original as WorkOrder
  const { setOpen, setCurrentRow } = useWorkOrders()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          onClick={(e) => e.stopPropagation()}
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuItem
          className='cursor-pointer'
          onClick={(e) => {
            e.stopPropagation()
            setCurrentRow(workOrder)
            setOpen('view')
          }}
        >
          View
          <DropdownMenuShortcut>
            <Eye size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem
          className='cursor-pointer'
          onClick={(e) => {
            e.stopPropagation()
            setCurrentRow(workOrder)
            setOpen('update')
          }}
        >
          Add Payment
          <DropdownMenuShortcut>
            <DollarSign size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem
          className='cursor-pointer'
          onClick={(e) => {
            e.stopPropagation()
            setCurrentRow(workOrder)
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
