import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useCustomers } from '../customers/customer-provider'
import { useDeleteVendor } from '@/hooks/useVendor'
import VendorMutateDrawer from './VendorMutateDrawer'
import VendorViewDrawer from './VendorViewDrawer'
import { useDrawerStore } from '@/stores/drawerStore'

const VendorDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useCustomers()
  const shopId = localStorage.getItem('shop-storage')
    ? JSON.parse(localStorage.getItem('shop-storage')!).state?.currentShopId
    : null

  const deleteMutation = useDeleteVendor(shopId || '')

  // global drawer state to blur bg
  const setDrawerOpen = useDrawerStore((s) => s.setDrawerOpen)

  return (
    <>
      {/* Create modal */}
      <VendorMutateDrawer
        key='vendor-create'
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={() => setOpen(null)}
      />

      {/* Update & Delete modals */}
      {currentRow && (
        <>
          {/* view drawer */}
          <VendorViewDrawer
            key={`vendor-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={(val: boolean) => {
              setOpen(val ? 'view' : null)
              // blur global state
              setDrawerOpen(val)
            }}
            currentRow={currentRow}
          />

          {/* update modal */}
          <VendorMutateDrawer
            key={`vendor-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(val: boolean) => setOpen(val ? 'update' : null)}
            currentRow={currentRow}
            onSave={() => setOpen(null)}
          />

          {/* delete modal */}
          <ConfirmDialog
            key='vendor-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(val: boolean) => setOpen(val ? 'delete' : null)}
            handleConfirm={() => {
              if (!shopId || !currentRow) return
              deleteMutation.mutate(
                { id: currentRow.id },
                {
                  onSuccess: () => {
                    setOpen(null)
                    setCurrentRow(null)
                    toast.success("The following vendor has been deleted")
                  },
                }
              )
            }}
            className='max-w-md'
            title={`Delete this vendor: ${currentRow.name} ?`}
            desc={
              <>
                You are about to delete a vendor with the name{' '}
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

export default VendorDialogs