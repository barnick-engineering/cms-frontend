import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import type { Vendor } from '../../schema/vendorSchema'

type VendorViewDrawerProps = {
  open: boolean
  onOpenChange: (val: boolean) => void
  currentRow: Vendor | null
}

const VendorViewDrawer = ({ open, onOpenChange, currentRow }: VendorViewDrawerProps) => {
  if (!currentRow) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-sm mx-auto p-6 space-y-4">
        <DrawerHeader>
          <DrawerTitle>Vendor Details</DrawerTitle>
          <DrawerDescription>View information for <strong>{currentRow.name}</strong></DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Name:</span> {currentRow.name}
          </div>
          <div>
            <span className="font-medium text-foreground">Email:</span> {currentRow.email || '—'}
          </div>
          <div>
            <span className="font-medium text-foreground">Phone:</span> {currentRow.phone || '—'}
          </div>
          <div>
            <span className="font-medium text-foreground">City:</span> {currentRow.city || '—'}
          </div>
          <div>
            <span className="font-medium text-foreground">Country:</span> {currentRow.country || '—'}
          </div>
          <div>
            <span className="font-medium text-foreground">Contact Person:</span> {currentRow.contactPerson || '—'}
          </div>
          <div>
            <span className="font-medium text-foreground">Contact Phone:</span> {currentRow.contactPersonPhone || '—'}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default VendorViewDrawer