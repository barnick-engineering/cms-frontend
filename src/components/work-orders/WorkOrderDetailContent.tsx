import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { WorkOrderDetailData } from '@/interface/workOrderInterface'

type WorkOrderDetailContentProps = {
  workOrderDetail: WorkOrderDetailData
}

export function WorkOrderDetailContent({ workOrderDetail }: WorkOrderDetailContentProps) {
  const isPaid = workOrderDetail.amount <= workOrderDetail.total_paid
  const pendingAmount = workOrderDetail.amount - workOrderDetail.total_paid

  const itemsSubtotal =
    workOrderDetail.items?.reduce(
      (sum, item) => sum + (item.total_order || 0) * (item.unit_price || 0),
      0
    ) ?? 0

  const totalExpenses =
    workOrderDetail.expense?.reduce((sum, expenseGroup) => sum + (expenseGroup.total || 0), 0) ?? 0
  const netProfit = itemsSubtotal - totalExpenses

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Work Order No</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{workOrderDetail.no || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {workOrderDetail.date
                ? new Date(workOrderDetail.date).toLocaleDateString()
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={isPaid ? 'default' : 'secondary'} className="text-sm">
              {isPaid ? 'Paid' : 'Pending'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Customer Information */}
      {workOrderDetail.customer && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Name:</span>
              <p className="text-base font-semibold">{workOrderDetail.customer.name || 'N/A'}</p>
            </div>
            {workOrderDetail.customer.phone && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                <p className="text-base">{workOrderDetail.customer.phone}</p>
              </div>
            )}
            {workOrderDetail.customer.address && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Address:</span>
                <p className="text-base">{workOrderDetail.customer.address}</p>
              </div>
            )}
            {workOrderDetail.customer.contact_person_name && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Contact Person:</span>
                <p className="text-base">{workOrderDetail.customer.contact_person_name}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b py-2">
              <span className="text-base font-medium">Subtotal (Items)</span>
              <p className="text-lg font-semibold">৳{itemsSubtotal.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex items-center justify-between border-b py-2">
              <span className="text-base font-medium">Total Expenses</span>
              <p className="text-lg font-semibold text-destructive">
                - ৳{totalExpenses.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex items-center justify-between border-b-2 border-primary py-2">
              <span className="text-base font-semibold">Net Profit</span>
              <p
                className={`text-xl font-bold ${netProfit >= 0 ? 'text-foreground' : 'text-destructive'}`}
              >
                ৳{netProfit.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
              <p className="text-xl font-bold">
                ৳{(workOrderDetail.amount || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Total Paid</span>
              <p className="text-xl font-bold text-foreground">
                ৳{(workOrderDetail.total_paid || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Pending</span>
              <p
                className={`text-xl font-bold ${pendingAmount > 0 ? 'text-muted-foreground' : 'text-foreground'}`}
              >
                ৳{pendingAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      {workOrderDetail.items && workOrderDetail.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Items ({workOrderDetail.total_items ?? workOrderDetail.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left font-medium">Item</th>
                    <th className="p-3 text-left font-medium">Details</th>
                    <th className="p-3 text-right font-medium">Quantity</th>
                    <th className="p-3 text-right font-medium">Unit Price</th>
                    <th className="p-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrderDetail.items.map((item, index) => (
                    <tr key={item.id ?? index} className="border-t hover:bg-muted/50">
                      <td className="p-3 font-medium">{item.item || 'N/A'}</td>
                      <td className="p-3 text-muted-foreground">{item.details || '-'}</td>
                      <td className="p-3 text-right">
                        {(item.total_order || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right">
                        ৳{(item.unit_price || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        ৳{((item.total_order || 0) * (item.unit_price || 0)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-primary bg-muted/30">
                    <td colSpan={4} className="p-3 text-right font-bold">
                      Subtotal:
                    </td>
                    <td className="p-3 text-right text-lg font-bold">
                      ৳{itemsSubtotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses */}
      {workOrderDetail.expense && workOrderDetail.expense.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workOrderDetail.expense.map((expenseGroup, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
                  <p className="text-lg font-bold">
                    ৳{(expenseGroup.total || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <Separator />
                {expenseGroup.details && expenseGroup.details.length > 0 && (
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-3 text-left font-medium">Expense No</th>
                          <th className="p-3 text-left font-medium">Purpose</th>
                          <th className="p-3 text-left font-medium">Details</th>
                          <th className="p-3 text-left font-medium">Paid By</th>
                          <th className="p-3 text-left font-medium">Date</th>
                          <th className="p-3 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenseGroup.details.map((expense, index) => (
                          <tr key={expense.id ?? index} className="border-t hover:bg-muted/50">
                            <td className="p-3 font-medium">{expense.no || 'N/A'}</td>
                            <td className="p-3">
                              <Badge variant="secondary">{expense.purpose || '-'}</Badge>
                            </td>
                            <td className="p-3 text-muted-foreground">{expense.details || '-'}</td>
                            <td className="p-3">{expense.paid_by || '-'}</td>
                            <td className="p-3">
                              {expense.expense_date
                                ? new Date(expense.expense_date).toLocaleDateString()
                                : '-'}
                            </td>
                            <td className="p-3 text-right font-semibold">
                              ৳{(expense.amount || 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-primary bg-muted/30">
                          <td colSpan={5} className="p-3 text-right font-bold">
                            Subtotal:
                          </td>
                          <td className="p-3 text-right text-lg font-bold">
                            ৳{(expenseGroup.total || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Remarks */}
      {workOrderDetail.remarks && (
        <Card>
          <CardHeader>
            <CardTitle>Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base">{workOrderDetail.remarks}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
