import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import type { WorkOrder } from '@/interface/workOrderInterface'
import { useWorkOrderById } from '@/hooks/useWorkOrder'

type WorkOrderViewDrawerProps = {
    open: boolean
    onOpenChange: (val: boolean) => void
    currentRow: WorkOrder | null
}

const WorkOrderViewDrawer = ({ open, onOpenChange, currentRow }: WorkOrderViewDrawerProps) => {
    const { data: workOrderDetail, isLoading } = useWorkOrderById(
        currentRow?.id || 0,
        { enabled: !!currentRow?.id && open }
    )

    if (!currentRow) return null

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-w-2xl mx-auto p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <DrawerHeader>
                    <DrawerTitle>Work Order Details</DrawerTitle>
                    <DrawerDescription>View information for <strong>{currentRow.no}</strong></DrawerDescription>
                </DrawerHeader>

                {isLoading ? (
                    <div className="text-center py-8">Loading work order details...</div>
                ) : workOrderDetail ? (
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-medium text-foreground">Work Order No:</span> {workOrderDetail.no}
                            </div>
                            <div>
                                <span className="font-medium text-foreground">Date:</span> {new Date(workOrderDetail.date).toLocaleDateString()}
                            </div>
                            <div>
                                <span className="font-medium text-foreground">Customer:</span> {workOrderDetail.customer.name}
                            </div>
                            <div>
                                <span className="font-medium text-foreground">Status:</span> {workOrderDetail.is_delivered ? 'Delivered' : 'Pending'}
                            </div>
                            <div>
                                <span className="font-medium text-foreground">Total Amount:</span> ৳{workOrderDetail.amount.toLocaleString('en-IN')}
                            </div>
                            <div>
                                <span className="font-medium text-foreground">Total Paid:</span> ৳{workOrderDetail.total_paid.toLocaleString('en-IN')}
                            </div>
                            <div>
                                <span className="font-medium text-foreground">Pending:</span> ৳{(workOrderDetail.amount - workOrderDetail.total_paid).toLocaleString('en-IN')}
                            </div>
                        </div>

                        {workOrderDetail.remarks && (
                            <div>
                                <span className="font-medium text-foreground">Remarks:</span> {workOrderDetail.remarks}
                            </div>
                        )}

                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Items:</h4>
                            <div className="border rounded-lg">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-2">Item</th>
                                            <th className="text-right p-2">Quantity</th>
                                            <th className="text-right p-2">Unit Price</th>
                                            <th className="text-right p-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {workOrderDetail.items.map((item, index) => (
                                            <tr key={index} className="border-t">
                                                <td className="p-2">{item.item}</td>
                                                <td className="p-2 text-right">{item.total_order.toLocaleString('en-IN')}</td>
                                                <td className="p-2 text-right">৳{item.unit_price.toLocaleString('en-IN')}</td>
                                                <td className="p-2 text-right">৳{(item.total_order * item.unit_price).toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Failed to load work order details</div>
                )}
            </DrawerContent>
        </Drawer>
    )
}

export default WorkOrderViewDrawer
