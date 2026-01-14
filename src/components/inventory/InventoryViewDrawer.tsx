import { useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useTrackInventoryById } from '@/hooks/useInventory'
import { useShopStore } from '@/stores/shopStore'
import type { InventoryItemInterface } from '@/interface/inventoryInterface'
import InventoryDetailsTrackingTable from './InventoryDetailsTrackingTable'
import { NoDataFound } from '../NoDataFound'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { toast } from 'sonner'
import { generateInventoryTrackingPDF } from '@/utils/enums/inventoryTrackingReportPdf'

type InventoryViewDrawerProps = {
  open: boolean
  onOpenChange: (val: boolean) => void
  currentRow: InventoryItemInterface | null
}

const InventoryViewDrawer = ({
  open,
  onOpenChange,
  currentRow,
}: InventoryViewDrawerProps) => {
  // Hooks MUST run unconditionally
  const shopId = useShopStore((s) => s.currentShopId)
  const shopName = useShopStore((s) => s.currentShopName)

  const inventoryId = currentRow?.id ?? ''

  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10

  const { data, isLoading, isError } = useTrackInventoryById(
    inventoryId,
    shopId,
    pageIndex + 1,
    pageSize,
    // only fetch when drawer is open
    { enabled: open && !!inventoryId && !!shopId }
  )

  const handleDownloadPDF = () => {
    if (!currentRow || !data || data.items.length === 0) {
      toast.error('No tracking data available to download')
      return
    }

    try {
      generateInventoryTrackingPDF(
        {
          no: currentRow.no || 'N/A',
          name: currentRow.name,
          description: currentRow.description,
          quantity: currentRow.quantity,
          lastPrice: currentRow.lastPrice,
          unitOfMeasurement: currentRow.unitOfMeasurement,
        },
        data.items,
        shopName || 'Shop Name'
      )
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')
    }
  }

  // safely stop ui rendering
  if (!currentRow) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-2xl mx-auto p-6 space-y-6">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-lg font-semibold">
                Inventory history
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                View information for{' '}
                <span className="font-medium">{currentRow.name}</span>
              </DrawerDescription>
            </div>
            
            {/* Download PDF Button */}
            {data && data.items.length > 0 && (
              <Button
                onClick={handleDownloadPDF}
                variant="default"
                size="sm"
                className="gap-2"
                disabled={isLoading}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </DrawerHeader>

        {/* Inventory Info */}
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Name:</span>{' '}
            {currentRow.name}
          </div>
          <div>
            <span className="font-medium text-foreground">Stock In Hand:</span>{' '}
            {currentRow.quantity}
          </div>
          <div className='flex gap-1'>
            <span className="font-medium text-foreground">Description:</span>{' '}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="max-w-50 truncate cursor-help">
                    {currentRow.description || 'N/A'}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs wrap-break-word">
                    {currentRow.description || 'N/A'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            <span className="font-medium text-foreground">Last Price:</span> {currentRow.lastPrice}
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        <h3 className="text-md font-semibold mb-2">Tracking</h3>

        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Loading tracking data...
          </p>
        )}

        {isError && (
          <p className="text-sm text-red-500">Error loading tracking data</p>
        )}

        {!isLoading && data && data.items.length === 0 && (
          <NoDataFound message="No tracking records found!" />
        )}

        {!isLoading && data && data.items.length > 0 && (
          <InventoryDetailsTrackingTable
            data={data.items}
            pageIndex={pageIndex}
            pageSize={pageSize}
            total={data.total}
            onPageChange={(newPage) => setPageIndex(newPage)}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

export default InventoryViewDrawer