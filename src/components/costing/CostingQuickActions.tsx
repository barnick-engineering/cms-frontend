import { ChevronDown, FileDown, FileJson, User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { CostingQuoteSnapshot } from '@/interface/costingInterface'
import {
  downloadCostingCustomerSlip,
  type CostingCustomerSlipData,
} from '@/lib/costing/customerSlipPrint'
import { downloadCostingThermalSlip } from '@/lib/costing/thermalReceiptPrint'
import { cn } from '@/lib/utils'
import { generateCostingQuotePDF } from '@/utils/enums/costingQuotePdf'
import type { CostingBreakdownData } from './CostingBreakdownCard'

type CostingQuickActionsProps = {
  snapshot: CostingQuoteSnapshot
  breakdown: CostingBreakdownData
  customerSlip: CostingCustomerSlipData
  className?: string
}

export function CostingQuickActions({
  snapshot,
  breakdown,
  customerSlip,
  className,
}: CostingQuickActionsProps) {
  const [downloadingCustomer, setDownloadingCustomer] = useState(false)
  const [downloadingCosting, setDownloadingCosting] = useState(false)
  const [moreExportsOpen, setMoreExportsOpen] = useState(false)

  const handleDownloadCostingSlip = async () => {
    setDownloadingCosting(true)
    try {
      await downloadCostingThermalSlip({
        ...breakdown,
        itemTitle: snapshot.itemTitle,
        timestamp: snapshot.timestamp,
      })
      toast.success('Costing slip downloaded as JPG')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Please try again.'
      toast.error('Failed to download costing slip', { description: message })
    } finally {
      setDownloadingCosting(false)
    }
  }

  const handleDownloadCustomerSlip = async () => {
    setDownloadingCustomer(true)
    try {
      await downloadCostingCustomerSlip(customerSlip)
      toast.success('Customer quote downloaded as JPG')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Please try again.'
      toast.error('Failed to download customer quote', { description: message })
    } finally {
      setDownloadingCustomer(false)
    }
  }

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `costing-quote-${snapshot.itemId}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Quote exported as JSON')
  }

  const handleExportPdf = async () => {
    try {
      await generateCostingQuotePDF(snapshot)
      toast.success('PDF downloaded')
    } catch {
      toast.error('Failed to generate PDF')
    }
  }

  const secondaryExports = (
    <>
      <Button
        variant="outline"
        className="w-full gap-2 bg-transparent"
        onClick={handleExportJson}
      >
        <FileJson className="h-4 w-4" />
        Export JSON
      </Button>
      <Button
        variant="outline"
        className="w-full gap-2 bg-transparent"
        onClick={handleExportPdf}
      >
        <FileDown className="h-4 w-4" />
        Export PDF
      </Button>
    </>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 costing-no-print">
        <Button
          className="w-full gap-2"
          onClick={handleDownloadCustomerSlip}
          disabled={downloadingCustomer}
        >
          <User className="h-4 w-4" />
          {downloadingCustomer ? 'Generating…' : 'Download Customer Slip'}
        </Button>
        <p className="text-xs text-muted-foreground text-center px-1">
          JPG image — product, qty, unit price, and total for sharing.
        </p>
        <Button
          variant="outline"
          className="w-full gap-2 bg-transparent"
          onClick={handleDownloadCostingSlip}
          disabled={downloadingCosting}
        >
          <FileDown className="h-4 w-4" />
          {downloadingCosting ? 'Generating…' : 'Download Costing Slip'}
        </Button>
        <p className="text-xs text-muted-foreground text-center px-1">
          JPG image with full internal production breakdown.
        </p>

        {/* Desktop: show all export options */}
        <div className="hidden sm:block space-y-2">
          {secondaryExports}
        </div>

        {/* Mobile: collapse JSON/PDF under "More exports" */}
        <Collapsible
          open={moreExportsOpen}
          onOpenChange={setMoreExportsOpen}
          className="sm:hidden"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between gap-2 text-muted-foreground"
            >
              More exports
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform',
                  moreExportsOpen && 'rotate-180'
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-1">
            {secondaryExports}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
