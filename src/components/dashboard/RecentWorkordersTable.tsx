import { NoDataFound } from "../NoDataFound"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"

interface WorkOrder {
  no: string
  customer: string
  amount: number
  paid: number
  is_delivered: boolean
}

interface RecentWorkordersTableProps {
  data?: {
    recent_workorders?: WorkOrder[]
  }
  isLoading?: boolean
}

const RecentWorkordersTable = ({ data, isLoading }: RecentWorkordersTableProps) => {
  const workorders = data?.recent_workorders || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading work orders...</p>
      </div>
    )
  }

  if (workorders.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-sm overflow-auto">
        <NoDataFound
          message="No Recent Work Orders"
          details="Work orders will appear here once created."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_100px] gap-4 text-sm font-semibold text-muted-foreground pb-2 border-b">
        <div>Work Order</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Paid</div>
        <div className="text-center">Status</div>
      </div>

      {/* Data Rows */}
      {workorders.map((wo, index) => (
        <div key={index} className="grid grid-cols-[2fr_1fr_1fr_100px] gap-4 items-center py-2 border-b last:border-0">
          <div className="space-y-1">
            <p className="text-sm leading-none font-medium">
              {wo.no}
            </p>
            <p className="text-muted-foreground text-xs">{wo.customer}</p>
          </div>

          <div className="font-medium text-right">
            ৳{wo.amount.toLocaleString('en-IN')}
          </div>

          <div className="font-medium text-right">
            ৳{wo.paid.toLocaleString('en-IN')}
          </div>

          <div className="flex justify-center">
            {wo.is_delivered ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Delivered
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" />
                Pending
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentWorkordersTable
