import { useMemo, useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useCustomerList } from '@/hooks/useCustomer'
import { useWorkOrderList } from '@/hooks/useWorkOrder'

type SampleHubFiltersProps = {
  customerId?: number
  workOrderId?: number
  onCustomerChange: (customerId?: number) => void
  onWorkOrderChange: (workOrderId?: number) => void
}

export function SampleHubFilters({
  customerId,
  workOrderId,
  onCustomerChange,
  onWorkOrderChange,
}: SampleHubFiltersProps) {
  const [customerSearch, setCustomerSearch] = useState('')
  const [workOrderSearch, setWorkOrderSearch] = useState('')

  const { data: customersData, isLoading: customersLoading } = useCustomerList(
    customerSearch || undefined,
    100,
    0
  )
  const customerOptions = useMemo(
    () =>
      (customersData?.data || []).map((customer) => ({
        value: String(customer.id),
        label: customer.name,
      })),
    [customersData]
  )

  const selectedCustomerName = customerOptions.find(
    (c) => c.value === String(customerId)
  )?.label

  const { data: workOrdersData, isLoading: workOrdersLoading } = useWorkOrderList(
    {
      search: workOrderSearch || undefined,
      limit: 100,
      offset: 0,
      customer_id: customerId,
    },
    { enabled: !!customerId }
  )
  const workOrderOptions = useMemo(
    () =>
      (workOrdersData?.data || []).map((workOrder) => ({
        value: String(workOrder.id),
        label: workOrder.no,
      })),
    [workOrdersData]
  )

  const selectedWorkOrderNo = workOrderOptions.find(
    (wo) => wo.value === String(workOrderId)
  )?.label

  const hasFilters = customerId != null || workOrderId != null

  const handleClear = () => {
    onCustomerChange(undefined)
    onWorkOrderChange(undefined)
    setCustomerSearch('')
    setWorkOrderSearch('')
  }

  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="border-b px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Filter gallery
            </CardTitle>
            <CardDescription>
              Choose a customer to load samples. Narrow by work order if needed.
            </CardDescription>
          </div>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 text-muted-foreground"
              onClick={handleClear}
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 py-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Customer
            </Label>
            <Combobox
              options={customerOptions}
              placeholder="Filter by customer..."
              emptyMessage="No customers found."
              value={customerId ? String(customerId) : ''}
              onSelect={(value) => {
                const parsed = value ? Number(value) : undefined
                onCustomerChange(parsed)
                onWorkOrderChange(undefined)
              }}
              onSearch={setCustomerSearch}
              onSearchClear={() => setCustomerSearch('')}
              loading={customersLoading}
              className="h-9 w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Work order
            </Label>
            <Combobox
              options={workOrderOptions}
              placeholder={
                customerId ? 'All work orders' : 'Select customer first'
              }
              emptyMessage="No work orders found."
              value={workOrderId ? String(workOrderId) : ''}
              onSelect={(value) => {
                onWorkOrderChange(value ? Number(value) : undefined)
              }}
              onSearch={setWorkOrderSearch}
              onSearchClear={() => setWorkOrderSearch('')}
              loading={workOrdersLoading}
              disabled={!customerId}
              className="h-9 w-full"
            />
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Active:</span>
            {customerId && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {selectedCustomerName ?? `Customer #${customerId}`}
              </span>
            )}
            {workOrderId && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                WO {selectedWorkOrderNo ?? workOrderId}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
