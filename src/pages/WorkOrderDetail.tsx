import { Link, useParams } from 'react-router-dom'
import { Main } from '@/components/layout/main'
import { useWorkOrderById } from '@/hooks/useWorkOrder'
import { useWorkOrderInvoice } from '@/hooks/useWorkOrderInvoice'
import { useWorkOrderDeliveryChallan } from '@/hooks/useWorkOrderDeliveryChallan'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { WorkOrderDetailContent } from '@/components/work-orders/WorkOrderDetailContent'

const WorkOrderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { data: workOrderDetail, isLoading, isError } = useWorkOrderById(id ?? '', {
    enabled: !!id,
  })
  const { generateInvoice } = useWorkOrderInvoice()
  const { generateDeliveryChallan } = useWorkOrderDeliveryChallan()

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

  const handleDownloadInvoice = () => {
    if (id) void generateInvoice(id)
  }

  const handleDownloadChallan = () => {
    if (id) void generateDeliveryChallan(id)
  }

  return (
    <Main className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/work-orders" aria-label="Back to work orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Work Order Details</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to={`/billing?work_order_id=${id}&type=quotation`}>
              <FileText className="mr-2 h-4 w-4" />
              Create Quotation
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/billing?work_order_id=${id}&type=invoice`}>
              <FileText className="mr-2 h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
          <Button variant="outline" onClick={handleDownloadInvoice}>
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
          <Button variant="outline" onClick={handleDownloadChallan}>
            <FileText className="mr-2 h-4 w-4" />
            Download Delivery Challan
          </Button>
        </div>
      </div>
      <WorkOrderDetailContent workOrderDetail={workOrderDetail} />
    </Main>
  )
}

export default WorkOrderDetail
