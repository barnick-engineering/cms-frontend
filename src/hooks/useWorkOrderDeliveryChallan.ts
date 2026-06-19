import { useCallback } from 'react'
import { toast } from 'sonner'
import { getWorkOrderById } from '@/api/workOrderApi'
import { workOrderToBillingPayload } from '@/interface/billingInterface'
import { printBillingDocument } from '@/lib/billing/printBillingDocument'

export const useWorkOrderDeliveryChallan = () => {
  const generateDeliveryChallan = useCallback(async (workOrderId: string | number) => {
    try {
      const workOrderDetail = await getWorkOrderById(workOrderId)

      if (!workOrderDetail) {
        toast.error('Failed to load work order details')
        return
      }

      await printBillingDocument(
        workOrderToBillingPayload(workOrderDetail, 'delivery_challan')
      )
      toast.success('Delivery challan ready to download')
    } catch (error) {
      console.error('Error generating delivery challan:', error)
      toast.error('Failed to generate delivery challan. Please try again.')
    }
  }, [])

  return { generateDeliveryChallan }
}
