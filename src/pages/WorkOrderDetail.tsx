import { Link, useParams } from 'react-router-dom'
import { Main } from '@/components/layout/main'
import { useWorkOrderById } from '@/hooks/useWorkOrder'
import { useWorkOrderInvoice } from '@/hooks/useWorkOrderInvoice'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'
import { WorkOrderDetailContent } from '@/components/work-orders/WorkOrderDetailContent'

const WorkOrderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { data: workOrderDetail, isLoading, isError } = useWorkOrderById(id ?? '', {
    enabled: !!id,
  })
  const { generateInvoice } = useWorkOrderInvoice()

  if (!id) {
    return (
      <Main>
        <p className="text-destructive">Invalid work order.</p>
        <Button variant="link" asChild>
          <Link to="/work-orders">Back to Work Orders</Link>
        </Button>
      </Main>
    )
  }

  if (isError || (!isLoading && !workOrderDetail)) {
    return (
      <Main>
        <p className="text-destructive">Work order not found.</p>
        <Button variant="link" asChild>
          <Link to="/work-orders">Back to Work Orders</Link>
        </Button>
      </Main>
    )
  }

  if (isLoading || !workOrderDetail) {
    return (
      <Main>
        <p className="text-muted-foreground">Loading work order details...</p>
      </Main>
    )
  }

  const handleDownloadPdf = () => {
    if (id) generateInvoice(id)
  }

  return (
    <Main>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/work-orders" aria-label="Back to work orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Work Order Details</h1>
        </div>
        <Button variant="outline" onClick={handleDownloadPdf}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      <WorkOrderDetailContent workOrderDetail={workOrderDetail} />
    </Main>
  )
}

export default WorkOrderDetail
