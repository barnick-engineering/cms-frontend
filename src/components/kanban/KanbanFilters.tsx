import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useCustomerList } from '@/hooks/useCustomer'
import { useDebounce } from '@/hooks/useDebounce'
import { useWorkOrderList } from '@/hooks/useWorkOrder'
import type {
  KanbanBoardParams,
  KanbanFilterValues,
} from '@/interface/kanbanInterface'

type KanbanFiltersProps = {
  values: KanbanFilterValues
  onChange: (patch: Partial<KanbanFilterValues>) => void
  onClear: () => void
}

export function kanbanFiltersToParams(
  filters: KanbanFilterValues
): KanbanBoardParams {
  return {
    search: filters.search,
    customer_id: filters.customerId,
    work_order_id: filters.workOrderId,
    overdue: filters.overdueOnly || undefined,
  }
}

export function KanbanFilters({
  values,
  onChange,
  onClear,
}: KanbanFiltersProps) {
  const [searchInput, setSearchInput] = useState(values.search ?? '')
  const debouncedSearch = useDebounce(searchInput, 300)

  const [customerSearch, setCustomerSearch] = useState('')
  const [workOrderSearch, setWorkOrderSearch] = useState('')

  const { data: customersData, isLoading: customersLoading } = useCustomerList(
    customerSearch || undefined,
    100,
    0
  )

  const { data: workOrdersData, isLoading: workOrdersLoading } =
    useWorkOrderList({
      search: workOrderSearch || undefined,
      customer_id: values.customerId,
      limit: 100,
      offset: 0,
    })

  const customerOptions = useMemo(
    () =>
      (customersData?.data ?? []).map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    [customersData]
  )

  const workOrderOptions = useMemo(
    () =>
      (workOrdersData?.data ?? []).map((wo) => ({
        value: String(wo.id),
        label: `${wo.no}${wo.customer ? ` | ${wo.customer}` : ''}`,
      })),
    [workOrdersData]
  )

  useEffect(() => {
    setSearchInput(values.search ?? '')
  }, [values.search])

  useEffect(() => {
    const next = debouncedSearch || undefined
    if (next !== values.search) {
      onChange({ search: next })
    }
  }, [debouncedSearch, values.search, onChange])

  const hasFilters =
    !!values.search ||
    !!values.customerId ||
    !!values.workOrderId ||
    !!values.overdueOnly

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[200px] flex-1 space-y-1.5">
        <Label className="text-xs font-medium">Search</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Title, customer, WO…"
            className="h-9 pl-8"
          />
        </div>
      </div>

      <div className="min-w-[180px] flex-1 space-y-1.5">
        <Label className="text-xs font-medium">Customer</Label>
        <Combobox
          options={customerOptions}
          placeholder="All customers"
          emptyMessage="No customers found."
          value={values.customerId ? String(values.customerId) : ''}
          onSelect={(val) => {
            const id = val ? Number(val) : undefined
            onChange({
              customerId: id,
              workOrderId: id ? values.workOrderId : undefined,
            })
          }}
          onSearch={setCustomerSearch}
          onSearchClear={() => setCustomerSearch('')}
          loading={customersLoading}
          className="h-9 w-full bg-background"
        />
      </div>

      <div className="min-w-[180px] flex-1 space-y-1.5">
        <Label className="text-xs font-medium">Work order</Label>
        <Combobox
          options={workOrderOptions}
          placeholder="All work orders"
          emptyMessage="No work orders found."
          value={values.workOrderId ? String(values.workOrderId) : ''}
          onSelect={(val) =>
            onChange({ workOrderId: val ? Number(val) : undefined })
          }
          onSearch={setWorkOrderSearch}
          onSearchClear={() => setWorkOrderSearch('')}
          loading={workOrdersLoading}
          className="h-9 w-full bg-background"
        />
      </div>

      <div className="flex items-center gap-2 pb-0.5">
        <Switch
          id="overdue-only"
          checked={values.overdueOnly ?? false}
          onCheckedChange={(checked) =>
            onChange({ overdueOnly: checked || undefined })
          }
        />
        <Label htmlFor="overdue-only" className="text-sm cursor-pointer">
          Overdue only
        </Label>
      </div>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 gap-1"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
