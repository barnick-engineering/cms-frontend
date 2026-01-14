import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer'
import type { ExpenseItemInterface } from '@/interface/expenseInterface'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type ExpenseViewDrawerProps = {
    open: boolean
    onOpenChange: (val: boolean) => void
    currentRow: ExpenseItemInterface | null
}

const ExpenseViewDrawer = ({
    open,
    onOpenChange,
    currentRow,
}: ExpenseViewDrawerProps) => {
    if (!currentRow) return null

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-w-xl mx-auto p-6 space-y-6">
                <DrawerHeader>
                    <DrawerTitle className="text-lg font-semibold">
                        Details
                    </DrawerTitle>
                    <DrawerDescription className="text-sm text-muted-foreground">
                        View details for{' '}
                        <span className="font-medium">{currentRow.title}</span>
                    </DrawerDescription>
                </DrawerHeader>

                {/* Expense Info */}
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                        <span className="font-medium text-foreground">Title:</span>{' '}
                        {currentRow.title}
                    </div>

                    <div>
                        <span className="font-medium text-foreground">Type:</span>{' '}
                        {currentRow.type.replace(/_/g, ' ')}
                    </div>

                    <div>
                        <span className="font-medium text-foreground">Amount:</span>
                        {currentRow.amount}
                    </div>

                    <div>
                        <span className="font-medium text-foreground">Created At:</span>{' '}
                        {new Date(currentRow.createdAt).toLocaleString()}
                    </div>

                    <div className="col-span-2 flex gap-1">
                        <span className="font-medium text-foreground">Remarks:</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="max-w-[350px] truncate cursor-help">
                                        {currentRow.remarks || 'N/A'}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-sm wrap-break-word">
                                        {currentRow.remarks || 'N/A'}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default ExpenseViewDrawer