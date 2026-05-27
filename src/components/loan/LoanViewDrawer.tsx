import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import type { Loan } from '@/interface/loanInterface'

type LoanViewDrawerProps = {
  open: boolean
  onOpenChange: (val: boolean) => void
  currentRow: Loan | null
}

const LoanViewDrawer = ({ open, onOpenChange, currentRow }: LoanViewDrawerProps) => {
  if (!currentRow) return null
  const computedRemaining = Math.max(0, Number(currentRow.amount || 0) - Number(currentRow.paid || 0))

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-xl mx-auto p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold">Loan Details</DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground">
            View loan information for <span className="font-medium">{currentRow.loan_for}</span>
          </DrawerDescription>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-foreground">Loan For:</span>{' '}
            <span className="text-muted-foreground">{currentRow.loan_for}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Loan From:</span>{' '}
            <span className="text-muted-foreground">{currentRow.loan_from || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Amount:</span>{' '}
            <span className="text-muted-foreground">৳{Number(currentRow.amount || 0).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Paid:</span>{' '}
            <span className="text-muted-foreground">৳{Number(currentRow.paid || 0).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Remaining:</span>{' '}
            <span className="text-muted-foreground">
              ৳{computedRemaining.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="font-medium text-foreground">Created At:</span>{' '}
            <span className="text-muted-foreground">
              {currentRow.created_at || currentRow.created
                ? new Date(currentRow.created_at || currentRow.created!).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="font-medium text-foreground">Remarks:</span>{' '}
            <span className="text-muted-foreground">{currentRow.remarks || 'N/A'}</span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default LoanViewDrawer
