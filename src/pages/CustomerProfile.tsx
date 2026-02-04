import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Main } from '@/components/layout/main'
import { useCustomerById } from '@/hooks/useCustomer'
import { useWorkOrderList } from '@/hooks/useWorkOrder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { NoDataFound } from '@/components/NoDataFound'

const WORK_ORDERS_PAGE_SIZE = 10

const CustomerProfile = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [workOrderPage, setWorkOrderPage] = useState(0)
  const offset = workOrderPage * WORK_ORDERS_PAGE_SIZE

  const { data: customer, isLoading: customerLoading, isError: customerError } = useCustomerById(id ?? '', {
    enabled: !!id,
  })
  const { data: workOrdersData, isLoading: workOrdersLoading } = useWorkOrderList(
    undefined,
    WORK_ORDERS_PAGE_SIZE,
    offset,
    id,
    { enabled: !!id }
  )
  const workOrders = workOrdersData?.data ?? []
  const workOrdersTotal = workOrdersData?.total ?? 0
  const workOrderPageCount = Math.ceil(workOrdersTotal / WORK_ORDERS_PAGE_SIZE) || 1

  const handleWorkOrderPageChange = useCallback((newPage: number) => {
    setWorkOrderPage((p) => Math.max(0, Math.min(newPage, workOrderPageCount - 1)))
  }, [workOrderPageCount])

  useEffect(() => {
    setWorkOrderPage(0)
  }, [id])

  if (!id) {
    return (
      <Main>
        <p className="text-destructive">Invalid customer.</p>
        <Button variant="link" asChild>
          <Link to="/customers">Back to Customers</Link>
        </Button>
      </Main>
    )
  }

  if (customerError || (customer === undefined && !customerLoading)) {
    return (
      <Main>
        <p className="text-destructive">Customer not found.</p>
        <Button variant="link" asChild>
          <Link to="/customers">Back to Customers</Link>
        </Button>
      </Main>
    )
  }

  if (customerLoading && !customer) {
    return (
      <Main>
        <p className="text-muted-foreground">Loading customer...</p>
      </Main>
    )
  }

  return (
    <Main>
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/customers" aria-label="Back to customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Customer Profile</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{customer?.name ?? '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{customer?.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{customer?.phone ?? '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{customer?.address || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact person</p>
              <p className="font-medium">{customer?.contact_person_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact person phone</p>
              <p className="font-medium">{customer?.contact_person_phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="font-medium">{customer?.is_company ? 'Yes' : 'No'}</p>
            </div>
            {customer?.remarks && (
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Remarks</p>
                <p className="font-medium">{customer.remarks}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work orders</CardTitle>
            <p className="text-sm text-muted-foreground">
              Work orders associated with this customer
            </p>
          </CardHeader>
          <CardContent>
            {workOrdersLoading ? (
              <p className="text-muted-foreground">Loading work orders...</p>
            ) : workOrders.length === 0 ? (
              <NoDataFound
                message="No work orders"
                details="This customer has no work orders yet."
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Work Order No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Total Paid</TableHead>
                      <TableHead className="text-right">Pending</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((wo) => {
                      const amount = wo.amount ?? 0
                      const totalPaid = wo.total_paid ?? 0
                      const pending = amount - totalPaid
                      const isPaid = amount <= totalPaid
                      return (
                        <TableRow
                          key={wo.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/work-orders/${wo.id}`)}
                        >
                          <TableCell className="font-medium" onClick={(e) => e.stopPropagation()}>
                            <Link
                              to={`/work-orders/${wo.id}`}
                              className="text-primary hover:underline"
                            >
                              {wo.no}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {wo.date
                              ? new Date(wo.date).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            ৳{amount.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-right">
                            ৳{totalPaid.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-right">
                            ৳{pending.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={isPaid ? 'default' : 'secondary'}>
                              {isPaid ? 'Paid' : 'Pending'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            {workOrders.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {workOrderPage + 1} of {workOrderPageCount} ({workOrdersTotal} total)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWorkOrderPageChange(workOrderPage - 1)}
                    disabled={workOrderPage <= 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWorkOrderPageChange(workOrderPage + 1)}
                    disabled={workOrderPage >= workOrderPageCount - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}

export default CustomerProfile
