import { useCallback } from 'react'
import { toast } from 'sonner'
import { getWorkOrderById } from '@/api/workOrderApi'
import { workOrderToBillingPayload } from '@/interface/billingInterface'
import { printBillingDocument } from '@/lib/billing/printBillingDocument'

export const useWorkOrderInvoice = () => {
  const generateInvoice = useCallback(async (workOrderId: string | number) => {
    try {
      const workOrderDetail = await getWorkOrderById(workOrderId)

      if (!workOrderDetail) {
        toast.error('Failed to load work order details')
        return
      }

      await printBillingDocument(
        workOrderToBillingPayload(workOrderDetail, 'invoice')
      )
      toast.success('Invoice ready to download')
    } catch (error) {
      console.error('Error generating invoice:', error)
      toast.error('Failed to generate invoice. Please try again.')
    }
  }, [])

  return { generateInvoice }
}
