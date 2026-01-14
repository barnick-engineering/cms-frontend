import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import InventoryMutateDrawer from './InventoryMutateDrawer'
import InventoryViewDrawer from './InventoryViewDrawer'
import { useDeleteInventory } from '@/hooks/useInventory'
import { useInventory } from './inventory-provider'
import { useDrawerStore } from '@/stores/drawerStore'

const InventoryDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useInventory()
  const shopId = localStorage.getItem('shop-storage')
    ? JSON.parse(localStorage.getItem('shop-storage')!).state?.currentShopId
    : null

  const deleteMutation = useDeleteInventory()

  // global drawer state to blur bg
  const setDrawerOpen = useDrawerStore((s) => s.setDrawerOpen)

  return (
    <>
      {/* Create modal */}
      <InventoryMutateDrawer
        key='inventory-create'
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={() => setOpen(null)}
      />

      {/* Update & Delete modals */}
      {currentRow && (
        <>
          {/* view drawer */}
          <InventoryViewDrawer
            key={`inventory-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={(val: boolean) => {
              setOpen(val ? 'view' : null) // local state
              setDrawerOpen(val)           // global blur state
            }}
            currentRow={currentRow}
          />

          {/* update modal */}
          <InventoryMutateDrawer
            key={`inventory-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(val: boolean) => setOpen(val ? 'update' : null)}
            currentRow={{
              ...currentRow,
              // ensure having shop id
              shopId: currentRow.shopId ?? shopId ?? '',
            }}
            onSave={() => setOpen(null)}
          />

          {/* delete modal */}
          <ConfirmDialog
            key='inventory-delete'
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
                    toast.success("The following inventory has been deleted")
                  },
                }
              )
            }}
            className='max-w-md'
            title={`Delete this inventory: ${currentRow.name} ?`}
            desc={
              <>
                You are about to delete a inventory with the name{' '}
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

export default InventoryDialogs