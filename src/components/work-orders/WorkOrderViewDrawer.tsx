import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import type { WorkOrder } from '@/interface/workOrderInterface'
import { useWorkOrderById } from '@/hooks/useWorkOrder'
import { WorkOrderDetailContent } from './WorkOrderDetailContent'

type WorkOrderViewDrawerProps = {
  open: boolean
  onOpenChange: (val: boolean) => void
  currentRow: WorkOrder | null
}

const WorkOrderViewDrawer = ({ open, onOpenChange, currentRow }: WorkOrderViewDrawerProps) => {
  const { data: workOrderDetail, isLoading, isError } = useWorkOrderById(
    currentRow?.id ?? 0,
    { enabled: !!currentRow?.id && open }
  )

  if (!currentRow) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-h-[90vh] max-w-4xl space-y-6 overflow-y-auto p-6">
        <DrawerHeader>
          <DrawerTitle>Work Order Details</DrawerTitle>
          <DrawerDescription>
            View information for <strong>{currentRow.no}</strong>
          </DrawerDescription>
        </DrawerHeader>
        {isLoading ? (
          <div className="py-8 text-center">Loading work order details...</div>
        ) : isError ? (
          <div className="py-8 text-center text-destructive">Failed to load work order details</div>
        ) : workOrderDetail ? (
          <WorkOrderDetailContent workOrderDetail={workOrderDetail} />
        ) : (
          <div className="py-8 text-center text-muted-foreground">Failed to load work order details</div>
        )}
      </DrawerContent>
    </Drawer>
  )
}

export default WorkOrderViewDrawer
