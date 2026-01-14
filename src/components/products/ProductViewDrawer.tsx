import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import type { Product } from '@/interface/productInterface'

type ProductViewDrawerProps = {
    open: boolean
    onOpenChange: (val: boolean) => void
    currentRow: Product | null
}

const ProductViewDrawer = ({ open, onOpenChange, currentRow }: ProductViewDrawerProps) => {
    if (!currentRow) return null

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-w-sm mx-auto p-6 space-y-4">
                <DrawerHeader>
                    <DrawerTitle>Product Details</DrawerTitle>
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
                        <span className="font-medium text-foreground">Details:</span> {currentRow.details || '—'}
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Price:</span> ৳{Number(currentRow.price).toLocaleString('en-IN')}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default ProductViewDrawer
