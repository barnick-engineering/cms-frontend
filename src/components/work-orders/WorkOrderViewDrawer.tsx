import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { WorkOrder } from '@/interface/workOrderInterface'
import { useWorkOrderById } from '@/hooks/useWorkOrder'

type WorkOrderViewDrawerProps = {
    open: boolean
    onOpenChange: (val: boolean) => void
    currentRow: WorkOrder | null
}

const WorkOrderViewDrawer = ({ open, onOpenChange, currentRow }: WorkOrderViewDrawerProps) => {
    const { data: workOrderDetail, isLoading, isError } = useWorkOrderById(
        currentRow?.id || 0,
        { enabled: !!currentRow?.id && open }
    )

    if (!currentRow) return null

    const isPaid = workOrderDetail ? (workOrderDetail.amount <= workOrderDetail.total_paid) : false
    const pendingAmount = workOrderDetail ? (workOrderDetail.amount - workOrderDetail.total_paid) : 0
    
    // Calculate subtotals
    const itemsSubtotal = workOrderDetail?.items?.reduce((sum, item) => {
        return sum + ((item.total_order || 0) * (item.unit_price || 0))
    }, 0) || 0
    
    const totalExpenses = workOrderDetail?.expense?.reduce((sum, expenseGroup) => {
        return sum + (expenseGroup.total || 0)
    }, 0) || 0
    
    const netProfit = itemsSubtotal - totalExpenses

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-w-4xl mx-auto p-6 space-y-6 max-h-[90vh] overflow-y-auto">
                <DrawerHeader>
                    <DrawerTitle>Work Order Details</DrawerTitle>
                    <DrawerDescription>View information for <strong>{currentRow.no}</strong></DrawerDescription>
                </DrawerHeader>

                {isLoading ? (
                    <div className="text-center py-8">Loading work order details...</div>
                ) : isError ? (
                    <div className="text-center py-8 text-destructive">Failed to load work order details</div>
                ) : workOrderDetail ? (
                    <div className="space-y-6">
                        {/* Header Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Work Order No</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-semibold">{workOrderDetail.no || currentRow.no}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Date</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-semibold">
                                        {workOrderDetail.date ? new Date(workOrderDetail.date).toLocaleDateString() : 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant={isPaid ? 'default' : 'secondary'} className="text-sm">
                                        {isPaid ? 'Paid' : 'Pending'}
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Customer Information */}
                        {workOrderDetail.customer && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Name:</span>
                                        <p className="text-base font-semibold">{workOrderDetail.customer.name || 'N/A'}</p>
                                    </div>
                                    {workOrderDetail.customer.phone && (
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                                            <p className="text-base">{workOrderDetail.customer.phone}</p>
                                        </div>
                                    )}
                                    {workOrderDetail.customer.address && (
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Address:</span>
                                            <p className="text-base">{workOrderDetail.customer.address}</p>
                                        </div>
                                    )}
                                    {workOrderDetail.customer.contact_person_name && (
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Contact Person:</span>
                                            <p className="text-base">{workOrderDetail.customer.contact_person_name}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Financial Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-base font-medium">Subtotal (Items)</span>
                                        <p className="text-lg font-semibold">৳{itemsSubtotal.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-base font-medium">Total Expenses</span>
                                        <p className="text-lg font-semibold text-destructive">- ৳{totalExpenses.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b-2 border-primary">
                                        <span className="text-base font-semibold">Net Profit</span>
                                        <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                                            ৳{netProfit.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                                        <p className="text-xl font-bold">৳{(workOrderDetail.amount || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Total Paid</span>
                                        <p className="text-xl font-bold text-foreground">৳{(workOrderDetail.total_paid || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Pending</span>
                                        <p className={`text-xl font-bold ${pendingAmount > 0 ? 'text-muted-foreground' : 'text-foreground'}`}>
                                            ৳{pendingAmount.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items */}
                        {workOrderDetail.items && workOrderDetail.items.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Items ({workOrderDetail.total_items || workOrderDetail.items.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="text-left p-3 font-medium">Item</th>
                                                    <th className="text-left p-3 font-medium">Details</th>
                                                    <th className="text-right p-3 font-medium">Quantity</th>
                                                    <th className="text-right p-3 font-medium">Unit Price</th>
                                                    <th className="text-right p-3 font-medium">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {workOrderDetail.items.map((item, index) => (
                                                    <tr key={item.id || index} className="border-t hover:bg-muted/50">
                                                        <td className="p-3 font-medium">{item.item || 'N/A'}</td>
                                                        <td className="p-3 text-muted-foreground">{item.details || '-'}</td>
                                                        <td className="p-3 text-right">{(item.total_order || 0).toLocaleString('en-IN')}</td>
                                                        <td className="p-3 text-right">৳{(item.unit_price || 0).toLocaleString('en-IN')}</td>
                                                        <td className="p-3 text-right font-semibold">
                                                            ৳{((item.total_order || 0) * (item.unit_price || 0)).toLocaleString('en-IN')}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="border-t-2 border-primary bg-muted/30">
                                                    <td colSpan={4} className="p-3 text-right font-bold">Subtotal:</td>
                                                    <td className="p-3 text-right font-bold text-lg">
                                                        ৳{itemsSubtotal.toLocaleString('en-IN')}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Expenses */}
                        {workOrderDetail.expense && workOrderDetail.expense.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Expenses</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {workOrderDetail.expense.map((expenseGroup, groupIndex) => (
                                        <div key={groupIndex} className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
                                                <p className="text-lg font-bold">৳{(expenseGroup.total || 0).toLocaleString('en-IN')}</p>
                                            </div>
                                            <Separator />
                                            {expenseGroup.details && expenseGroup.details.length > 0 && (
                                                <div className="border rounded-lg overflow-hidden">
                                                    <table className="w-full">
                                                        <thead className="bg-muted">
                                                            <tr>
                                                                <th className="text-left p-3 font-medium">Expense No</th>
                                                                <th className="text-left p-3 font-medium">Purpose</th>
                                                                <th className="text-left p-3 font-medium">Details</th>
                                                                <th className="text-left p-3 font-medium">Paid By</th>
                                                                <th className="text-left p-3 font-medium">Date</th>
                                                                <th className="text-right p-3 font-medium">Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {expenseGroup.details.map((expense, index) => (
                                                                <tr key={expense.id || index} className="border-t hover:bg-muted/50">
                                                                    <td className="p-3 font-medium">{expense.no || 'N/A'}</td>
                                                                    <td className="p-3">
                                                                        <Badge variant="secondary">{expense.purpose || '-'}</Badge>
                                                                    </td>
                                                                    <td className="p-3 text-muted-foreground">{expense.details || '-'}</td>
                                                                    <td className="p-3">{expense.paid_by || '-'}</td>
                                                                    <td className="p-3">
                                                                        {expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : '-'}
                                                                    </td>
                                                                    <td className="p-3 text-right font-semibold">
                                                                        ৳{(expense.amount || 0).toLocaleString('en-IN')}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            <tr className="border-t-2 border-primary bg-muted/30">
                                                                <td colSpan={5} className="p-3 text-right font-bold">Subtotal:</td>
                                                                <td className="p-3 text-right font-bold text-lg">
                                                                    ৳{(expenseGroup.total || 0).toLocaleString('en-IN')}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Remarks */}
                        {workOrderDetail.remarks && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Remarks</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-base">{workOrderDetail.remarks}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Failed to load work order details</div>
                )}
            </DrawerContent>
        </Drawer>
    )
}

export default WorkOrderViewDrawer
