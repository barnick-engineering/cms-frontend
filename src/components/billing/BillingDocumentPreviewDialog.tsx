import { useEffect, useRef } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BillingDocumentPreview } from '@/components/billing/BillingDocumentPreview'
import { useBillingDocumentById } from '@/hooks/useBilling'
import { printBillingPreview } from '@/lib/billing/billingPrint'
import { billingDocumentToFormPayload } from '@/interface/billingInterface'
import { BILLING_DOCUMENT_TYPE_LABELS } from '@/interface/billingInterface'

type BillingDocumentPreviewDialogProps = {
  documentId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  autoPrint?: boolean
}

export function BillingDocumentPreviewDialog({
  documentId,
  open,
  onOpenChange,
  autoPrint = false,
}: BillingDocumentPreviewDialogProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const hasPrintedRef = useRef(false)

  const { data: doc, isLoading, isError } = useBillingDocumentById(documentId ?? 0, {
    enabled: open && !!documentId,
  })

  useEffect(() => {
    if (!open) {
      hasPrintedRef.current = false
      return
    }
    if (!autoPrint || !doc || hasPrintedRef.current) return

    hasPrintedRef.current = true
    const timer = setTimeout(() => {
      void printBillingPreview(previewRef.current)
    }, 400)
    return () => clearTimeout(timer)
  }, [open, autoPrint, doc])

  const handleDownload = async () => {
    await printBillingPreview(previewRef.current)
  }

  const title = doc
    ? `${BILLING_DOCUMENT_TYPE_LABELS[doc.document_type]}${doc.document_number ? ` — ${doc.document_number}` : ''}`
    : 'Document preview'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-1rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="billing-no-print shrink-0 border-b bg-background px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pr-0">
            <DialogTitle className="min-w-0 break-words text-left text-base sm:text-lg">
              {title}
            </DialogTitle>
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleDownload}
              disabled={!doc || isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Download / Print
            </Button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading preview...
            </div>
          )}
          {isError && (
            <p className="py-8 text-center text-destructive">
              Failed to load document preview.
            </p>
          )}
          {doc && (
            <div ref={previewRef} className="min-w-0 w-full">
              <BillingDocumentPreview data={billingDocumentToFormPayload(doc)} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
