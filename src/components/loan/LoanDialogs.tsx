import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteLoan } from '@/hooks/useLoan'
import LoanMutateDrawer from './LoanMutateDrawer'
import { useLoan } from './loan-provider'
import LoanViewDrawer from './LoanViewDrawer'

const LoanDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useLoan()
  const deleteMutation = useDeleteLoan()

  return (
    <>
      <LoanMutateDrawer
        key="loan-create"
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={() => setOpen(null)}
      />

      {currentRow && (
        <>
          <LoanViewDrawer
            key={`loan-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={(val) => setOpen(val ? 'view' : null)}
            currentRow={currentRow}
          />
          <LoanMutateDrawer
            key={`loan-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(val) => setOpen(val ? 'update' : null)}
            currentRow={currentRow}
            onSave={() => setOpen(null)}
          />
          <ConfirmDialog
            key="loan-delete"
            destructive
            open={open === 'delete'}
            onOpenChange={(val: boolean) => setOpen(val ? 'delete' : null)}
            handleConfirm={() => {
              if (!currentRow) return
              deleteMutation.mutate(currentRow.id, {
                onSuccess: () => {
                  setOpen(null)
                  setCurrentRow(null)
                  toast.success('The loan has been deleted successfully')
                },
              })
            }}
            className="max-w-md"
            title={`Delete this loan: ${currentRow.loan_for}?`}
            desc={
              <>
                You are about to delete this loan record.
                <br />
                This action cannot be undone.
              </>
            }
            confirmText="Delete"
          />
        </>
      )}
    </>
  )
}

export default LoanDialogs
