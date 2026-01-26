import { ConfirmDialog } from '@/components/confirm-dialog'
import { useWorkOrders } from './work-order-provider'
import { useDeleteWorkOrder } from '@/hooks/useWorkOrder'
import WorkOrderMutateDrawer from "./WorkOrderMutateDrawer"
import WorkOrderViewDrawer from './WorkOrderViewDrawer'
import WorkOrderUpdateDrawer from './WorkOrderUpdateDrawer'
import { useDrawerStore } from '@/stores/drawerStore'

const WorkOrderDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useWorkOrders()
  const deleteMutation = useDeleteWorkOrder()

  const setDrawerOpen = useDrawerStore((s) => s.setDrawerOpen)

  return (
    <>
      <WorkOrderMutateDrawer
        key='work-order-create'
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={() => setOpen(null)}
      />

      {currentRow && (
        <>
          <WorkOrderMutateDrawer
            key={`work-order-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(val) => setOpen(val ? 'edit' : null)}
            currentRow={currentRow}
            onSave={() => setOpen(null)}
          />

          <WorkOrderViewDrawer
            key={`work-order-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={(val: boolean) => {
              setOpen(val ? 'view' : null)
              setDrawerOpen(val)
            }}
            currentRow={currentRow}
          />

          <WorkOrderUpdateDrawer
            key={`work-order-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(val: boolean) => setOpen(val ? 'update' : null)}
            currentRow={currentRow}
            onSave={() => setOpen(null)}
          />

          <ConfirmDialog
            key='work-order-delete'
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
            title={`Delete this work order: ${currentRow.no} ?`}
            desc={
              <>
                You are about to delete a work order with the number{' '}
                <strong>{currentRow.no}</strong>. <br />
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

export default WorkOrderDialogs
