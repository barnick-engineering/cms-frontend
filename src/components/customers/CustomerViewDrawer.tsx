import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import type { Customer } from '../../schema/customerSchema'

type CustomerViewDrawerProps = {
    open: boolean
    onOpenChange: (val: boolean) => void
    currentRow: Customer | null
}

const CustomerViewDrawer = ({ open, onOpenChange, currentRow }: CustomerViewDrawerProps) => {
    if (!currentRow) return null

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-w-sm mx-auto p-6 space-y-4">
                <DrawerHeader>
                    <DrawerTitle>Customer Details</DrawerTitle>
                    <DrawerDescription>View information for <strong>{currentRow.name}</strong></DrawerDescription>
                </DrawerHeader>

                <div className="space-y-3 text-sm text-muted-foreground">
                    <div>
                        <span className="font-medium text-foreground">ID:</span> {currentRow.id}
                    </div>
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
                        <span className="font-medium text-foreground">Address:</span> {currentRow.address || '—'}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Contact Person:</span> {currentRow.contact_person_name || '—'}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Contact Phone:</span> {currentRow.contact_person_phone || '—'}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Is Company:</span> {currentRow.is_company ? 'Yes' : 'No'}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Remarks:</span> {currentRow.remarks || '—'}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Status:</span> {currentRow.status ? 'Active' : 'Inactive'}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Created:</span> {new Date(currentRow.created).toLocaleDateString()}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default CustomerViewDrawer