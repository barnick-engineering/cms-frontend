import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { BulkActionsToolbar } from '@/components/bulk-actions-toolbar'
import { useDeleteExpense } from '@/hooks/useExpense'
import { ConfirmDialog } from '../confirm-dialog'

export interface DataTableBulkActionsProps<TData extends { id: string }> {
    table: Table<TData>
}

export function ExpenseTableBulkActions<TData extends { id: string }>({
    table,
}: DataTableBulkActionsProps<TData>) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [rowsToDelete, setRowsToDelete] = useState<string[]>([])
    const deleteMutation = useDeleteExpense()

    const selectedRows = table.getSelectedRowModel().rows

    // Triggered when user clicks bulk delete button
    const handleBulkDeleteClick = () => {
        if (!selectedRows.length) return
        setRowsToDelete(selectedRows.map((r) => r.original.id))
        setShowDeleteConfirm(true)
    }

    // Triggered when user confirms delete (single or multi)
    const handleConfirmDelete = () => {
        rowsToDelete.forEach((id) => {
            deleteMutation.mutate(
                { id }, // ✅ Pass object { id }
                {
                    onSuccess: () => {
                        table.resetRowSelection()
                    },
                }
            )
        })
        setShowDeleteConfirm(false)
    }

    return (
        <>
            {/* Bulk Actions Toolbar */}
            <BulkActionsToolbar table={table} entityName='expense'>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='destructive'
                            size='icon'
                            onClick={handleBulkDeleteClick}
                            className='size-8'
                            aria-label='Delete selected Expense'
                            title='Delete selected Expense'
                        >
                            <Trash2 />
                            <span className='sr-only'>Delete selected Expense</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete selected Expense</p>
                    </TooltipContent>
                </Tooltip>
            </BulkActionsToolbar>

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                destructive
                title={`Delete ${rowsToDelete.length} expense(s)?`}
                desc={
                    <>
                        You are about to delete <strong>{rowsToDelete.length} expense(s)</strong>. <br />
                        This action cannot be undone.
                    </>
                }
                confirmText='Delete'
                handleConfirm={handleConfirmDelete}
            />
        </>
    )
}