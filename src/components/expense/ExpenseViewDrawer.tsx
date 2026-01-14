import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer'
import type { Expense } from '@/interface/expenseInterface'

type ExpenseViewDrawerProps = {
    open: boolean
    onOpenChange: (val: boolean) => void
    currentRow: Expense | null
}

const ExpenseViewDrawer = ({
    open,
    onOpenChange,
    currentRow,
}: ExpenseViewDrawerProps) => {
    if (!currentRow) return null

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-w-xl mx-auto p-6 space-y-6 max-h-[90vh] overflow-y-auto">
                <DrawerHeader>
                    <DrawerTitle className="text-lg font-semibold">
                        Expense Details
                    </DrawerTitle>
                    <DrawerDescription className="text-sm text-muted-foreground">
                        View details for expense <span className="font-medium">{currentRow.no}</span>
                    </DrawerDescription>
                </DrawerHeader>

                {/* Expense Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-foreground">Expense No:</span>{' '}
                        <span className="text-muted-foreground">{currentRow.no}</span>
                    </div>

                    <div>
                        <span className="font-medium text-foreground">Work Order:</span>{' '}
                        <span className="text-muted-foreground">{currentRow.workorder}</span>
                    </div>

                    <div>
                        <span className="font-medium text-foreground">Purpose:</span>{' '}
                        <span className="text-muted-foreground">{currentRow.purpose}</span>
                    </div>

                    <div>
                        <span className="font-medium text-foreground">Amount:</span>{' '}
                        <span className="text-muted-foreground">৳{currentRow.amount.toLocaleString('en-IN')}</span>
                    </div>

                    <div>
                        <span className="font-medium text-foreground">Details:</span>{' '}
                        <span className="text-muted-foreground">{currentRow.details || 'N/A'}</span>
                    </div>

                    <div>
                        <span className="font-medium text-foreground">Expense Date:</span>{' '}
                        <span className="text-muted-foreground">
                            {currentRow.expense_date ? new Date(currentRow.expense_date).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>

                    {currentRow.customer && (
                        <div>
                            <span className="font-medium text-foreground">Customer:</span>{' '}
                            <span className="text-muted-foreground">{currentRow.customer}</span>
                        </div>
                    )}

                    <div>
                        <span className="font-medium text-foreground">Cost Paid By:</span>{' '}
                        <span className="text-muted-foreground">{currentRow.cost_paid_by}</span>
                    </div>

                    {currentRow.bill_disbursed_date && (
                        <div>
                            <span className="font-medium text-foreground">Bill Disbursed Date:</span>{' '}
                            <span className="text-muted-foreground">
                                {new Date(currentRow.bill_disbursed_date).toLocaleDateString()}
                            </span>
                        </div>
                    )}

                    {currentRow.remarks && (
                        <div className="col-span-2">
                            <span className="font-medium text-foreground">Remarks:</span>{' '}
                            <span className="text-muted-foreground">{currentRow.remarks}</span>
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default ExpenseViewDrawer
