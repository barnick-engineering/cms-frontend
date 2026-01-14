import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { BulkActionsToolbar } from '@/components/bulk-actions-toolbar'
import { ConfirmDialog } from '../confirm-dialog'
import { useDeleteWorkOrder } from '@/hooks/useWorkOrder'

export interface DataTableBulkActionsProps<TData extends { id: number | string }> {
    table: Table<TData>
}

export function DataTableBulkActions<TData extends { id: number | string }>({
    table,
}: DataTableBulkActionsProps<TData>) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const deleteMutation = useDeleteWorkOrder()

    const selectedRows = table.getSelectedRowModel().rows

    const handleDelete = () => {
        if (!selectedRows.length) return

        const ids = selectedRows.map((r) => r.original.id)

        ids.forEach((id) => {
            deleteMutation.mutate(id, {
                onSuccess: () => {
                    table.resetRowSelection()
                },
            })
        })

        setShowDeleteConfirm(false)
    }

    return (
        <>
            <BulkActionsToolbar table={table} entityName='work order'>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='destructive'
                            size='icon'
                            onClick={() => setShowDeleteConfirm(true)}
                            className='size-8'
                            aria-label='Delete selected Work Orders'
                            title='Delete selected Work Orders'
                        >
                            <Trash2 />
                            <span className='sr-only'>Delete selected Work Orders</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete selected Work Orders</p>
                    </TooltipContent>
                </Tooltip>
            </BulkActionsToolbar>

            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                destructive
                title={`Delete ${selectedRows.length} selected work order(s)?`}
                desc={
                    <>
                        You are about to delete{' '}
                        <strong>{selectedRows.length} work order(s)</strong>. <br />
                        This action cannot be undone.
                    </>
                }
                confirmText='Delete'
                handleConfirm={handleDelete}
            />
        </>
    )
}
