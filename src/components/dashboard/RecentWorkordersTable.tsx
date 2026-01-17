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
      <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_100px] gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-muted-foreground pb-2 border-b">
        <div>Work Order</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Paid</div>
        <div className="text-center">Status</div>
      </div>

      {/* Data Rows */}
      {workorders.map((wo, index) => (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_100px] gap-2 sm:gap-4 items-start sm:items-center py-2 border-b last:border-0">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm leading-none font-medium">
              {wo.no}
            </p>
            <p className="text-muted-foreground text-xs">{wo.customer}</p>
          </div>

          <div className="flex justify-between sm:justify-end items-center">
            <span className="text-xs sm:hidden text-muted-foreground font-medium">Amount:</span>
            <span className="font-medium text-right text-xs sm:text-sm">
              ৳{wo.amount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between sm:justify-end items-center">
            <span className="text-xs sm:hidden text-muted-foreground font-medium">Paid:</span>
            <span className="font-medium text-right text-xs sm:text-sm">
              ৳{wo.paid.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between sm:justify-center items-center">
            <span className="text-xs sm:hidden text-muted-foreground font-medium">Status:</span>
            <div className="flex sm:justify-center">
              {wo.is_delivered ? (
                <Badge variant="default" className="gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Delivered</span>
                  <span className="sm:hidden">Del</span>
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <XCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">Pending</span>
                  <span className="sm:hidden">Pen</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentWorkordersTable
