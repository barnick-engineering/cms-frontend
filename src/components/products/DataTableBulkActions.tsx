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
import { useDeleteProduct } from '@/hooks/useProduct'

export interface DataTableBulkActionsProps<TData extends { id: number | string }> {
    table: Table<TData>
}

export function DataTableBulkActions<TData extends { id: number | string }>({
    table,
}: DataTableBulkActionsProps<TData>) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const deleteMutation = useDeleteProduct()

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
            <BulkActionsToolbar table={table} entityName='product'>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='destructive'
                            size='icon'
                            onClick={() => setShowDeleteConfirm(true)}
                            className='size-8'
                            aria-label='Delete selected Products'
                            title='Delete selected Products'
                        >
                            <Trash2 />
                            <span className='sr-only'>Delete selected Products</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete selected Products</p>
                    </TooltipContent>
                </Tooltip>
            </BulkActionsToolbar>

            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                destructive
                title={`Delete ${selectedRows.length} selected product(s)?`}
                desc={
                    <>
                        You are about to delete{' '}
                        <strong>{selectedRows.length} product(s)</strong>. <br />
                        This action cannot be undone.
                    </>
                }
                confirmText='Delete'
                handleConfirm={handleDelete}
            />
        </>
    )
}
