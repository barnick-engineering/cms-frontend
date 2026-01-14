import { ConfirmDialog } from '@/components/confirm-dialog'
import { useCustomers } from './customer-provider'
import { useDeleteCustomer } from '@/hooks/useCustomer'
import CustomersMutateDrawer from "./CustomersMutateDrawer"
import CustomerViewDrawer from './CustomerViewDrawer'
import { useDrawerStore } from '@/stores/drawerStore'

const CustomersDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useCustomers()
  const deleteMutation = useDeleteCustomer()

  // global drawer state to blur bg
  const setDrawerOpen = useDrawerStore((s) => s.setDrawerOpen)

  return (
    <>
      {/* create modal */}
      <CustomersMutateDrawer
        key='customer-create'
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={() => setOpen(null)}
      />

      {/* Update & Delete modals */}
      {currentRow && (
        <>
          {/* view drawer */}
          <CustomerViewDrawer
            key={`customer-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={(val: boolean) => {
              setOpen(val ? 'view' : null)
              // global blur state
              setDrawerOpen(val)
            }}
            currentRow={currentRow}
          />

          {/* update modal */}
          <CustomersMutateDrawer
            key={`customer-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(val: boolean) => setOpen(val ? 'update' : null)}
            currentRow={currentRow}
            onSave={() => setOpen(null)}
          />

          {/* delete modal */}
          <ConfirmDialog
            key='customer-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(val: boolean) => setOpen(val ? 'delete' : null)}
            handleConfirm={() => {
              if (!currentRow) return
              deleteMutation.mutate(
                currentRow.id,
                {
                  onSuccess: () => {
                    setOpen(null)
                    setCurrentRow(null)
                  },
                }
              )
            }}
            className='max-w-md'
            title={`Delete this customer: ${currentRow.name} ?`}
            desc={
              <>
                You are about to delete a customer with the name{' '}
                <strong>{currentRow.name}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}

export default CustomersDialogs