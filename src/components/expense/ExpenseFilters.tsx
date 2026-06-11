import { useEffect, useMemo, useState } from 'react'
import { Filter, Search, X } from 'lucide-react'
import { Combobox } from '@/components/ui/combobox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { expensePurposes } from '@/constance/expenseConstance'
import { useCustomerList } from '@/hooks/useCustomer'
import { useWorkOrderList } from '@/hooks/useWorkOrder'
import { useDebounce } from '@/hooks/useDebounce'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

export type ExpenseFilterValues = {
  search?: string
  customerId?: string | number
  workOrderId?: string | number
  purpose?: string
}

type ExpenseFiltersProps = {
  values: ExpenseFilterValues
  onChange: (patch: Partial<ExpenseFilterValues>) => void
  onClear: () => void
}

function countAdvancedFilters(values: ExpenseFilterValues) {
  let n = 0
  if (values.customerId) n++
  if (values.workOrderId) n++
  if (values.purpose) n++
  return n
}

function AdvancedFilterFields({
  values,
  onChange,
  setCustomerSearch,
  customerOptions,
  customersLoading,
  onCustomerSelect,
  setWorkOrderSearch,
  workOrderOptions,
  workOrdersLoading,
  onWorkOrderSelect,
  purposeOptions,
  className,
}: {
  values: ExpenseFilterValues
  onChange: (patch: Partial<ExpenseFilterValues>) => void
  setCustomerSearch: (v: string) => void
  customerOptions: { value: string; label: string }[]
  customersLoading: boolean
  onCustomerSelect: (value: string) => void
  setWorkOrderSearch: (v: string) => void
  workOrderOptions: { value: string; label: string }[]
  workOrdersLoading: boolean
  onWorkOrderSelect: (value: string) => void
  purposeOptions: { value: string; label: string }[]
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Customer</Label>
        <Combobox
          options={customerOptions}
          placeholder="All customers"
          emptyMessage="No customers found."
          value={values.customerId ? String(values.customerId) : ''}
          onSelect={onCustomerSelect}
          onSearch={setCustomerSearch}
          onSearchClear={() => setCustomerSearch('')}
          loading={customersLoading}
          className="h-8 w-full bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Work order</Label>
        <Combobox
          options={workOrderOptions}
          placeholder="All work orders"
          emptyMessage="No work orders found."
          value={values.workOrderId ? String(values.workOrderId) : ''}
          onSelect={onWorkOrderSelect}
          onSearch={setWorkOrderSearch}
          onSearchClear={() => setWorkOrderSearch('')}
          loading={workOrdersLoading}
          className="h-8 w-full bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Purpose</Label>
        <Combobox
          options={purposeOptions}
          placeholder="All purposes"
          emptyMessage="No purposes found."
          value={values.purpose ?? ''}
          onSelect={(val) => {
            if (val === '__clear__' || !val) {
              onChange({ purpose: undefined })
            } else {
              onChange({ purpose: val })
            }
          }}
          className="h-8 w-full bg-background"
        />
      </div>
    </div>
  )
}

export function ExpenseFilters({
  values,
  onChange,
  onClear,
}: ExpenseFiltersProps) {
  const isMobile = useIsMobile()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(values.search ?? '')
  const [customerSearch, setCustomerSearch] = useState('')
  const [workOrderSearch, setWorkOrderSearch] = useState('')

  const debouncedSearch = useDebounce(searchInput, 300)

  const { data: customersData, isLoading: customersLoading } = useCustomerList(
    customerSearch || undefined,
    100,
    0
  )

  const { data: workOrdersData, isLoading: workOrdersLoading } = useWorkOrderList({
    search: workOrderSearch || undefined,
    limit: 100,
    offset: 0,
  })

  const customerOptions = useMemo(() => {
    const options = (customersData?.data || []).map((customer) => ({
      value: String(customer.id),
      label: customer.name,
    }))
    return [{ value: '__clear__', label: 'All customers' }, ...options]
  }, [customersData])

  const workOrderOptions = useMemo(() => {
    const options = (workOrdersData?.data || []).map((workOrder) => ({
      value: String(workOrder.id),
      label: workOrder.no,
    }))
    return [{ value: '__clear__', label: 'All work orders' }, ...options]
  }, [workOrdersData])

  const purposeOptions = useMemo(() => {
    const options = expensePurposes.map((purpose) => ({
      value: purpose.value,
      label: purpose.label,
    }))
    return [{ value: '__clear__', label: 'All purposes' }, ...options]
  }, [])

  const selectedCustomerLabel = customerOptions.find(
    (c) => c.value === String(values.customerId)
  )?.label

  const selectedWorkOrderLabel = workOrderOptions.find(
    (wo) => wo.value === String(values.workOrderId)
  )?.label

  const selectedPurposeLabel = purposeOptions.find(
    (p) => p.value === values.purpose
  )?.label

  useEffect(() => {
    setSearchInput(values.search ?? '')
  }, [values.search])

  useEffect(() => {
    const next = debouncedSearch || undefined
    if (next !== values.search) {
      onChange({ search: next })
    }
  }, [debouncedSearch, values.search, onChange])

  const advancedCount = countAdvancedFilters(values)
  const hasAnyFilter = values.search || advancedCount > 0

  const handleCustomerSelect = (value: string) => {
    if (value === '__clear__' || !value) {
      onChange({ customerId: undefined })
      return
    }
    onChange({ customerId: value })
  }

  const handleWorkOrderSelect = (value: string) => {
    if (value === '__clear__' || !value) {
      onChange({ workOrderId: undefined })
      return
    }
    onChange({ workOrderId: value })
  }

  const handleClearAll = () => {
    setSearchInput('')
    onClear()
    setFiltersOpen(false)
  }

  const advancedFieldsProps = {
    values,
    onChange,
    setCustomerSearch,
    customerOptions,
    customersLoading,
    onCustomerSelect: handleCustomerSelect,
    setWorkOrderSearch,
    workOrderOptions,
    workOrdersLoading,
    onWorkOrderSelect: handleWorkOrderSelect,
    purposeOptions,
  }

  const chips: { key: string; label: string; onRemove: () => void }[] = []

  if (values.customerId && selectedCustomerLabel) {
    chips.push({
      key: 'customer',
      label: selectedCustomerLabel,
      onRemove: () => onChange({ customerId: undefined }),
    })
  }
  if (values.workOrderId && selectedWorkOrderLabel) {
    chips.push({
      key: 'workorder',
      label: selectedWorkOrderLabel,
      onRemove: () => onChange({ workOrderId: undefined }),
    })
  }
  if (values.purpose && selectedPurposeLabel) {
    chips.push({
      key: 'purpose',
      label: selectedPurposeLabel,
      onRemove: () => onChange({ purpose: undefined }),
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search expense no, details, amount…"
            className="h-8 w-full pl-8 lg:w-72"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isMobile ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 flex-1 sm:flex-none"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
              {advancedCount > 0 && (
                <Badge variant="secondary" className="h-5 min-w-5 px-1 text-xs">
                  {advancedCount}
                </Badge>
              )}
            </Button>
          ) : (
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                  {advancedCount > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-5 px-1 text-xs">
                      {advancedCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[min(100vw-2rem,360px)] p-4"
                align="end"
                sideOffset={8}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">More filters</p>
                  {advancedCount > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() => {
                        onChange({
                          customerId: undefined,
                          workOrderId: undefined,
                          purpose: undefined,
                        })
                      }}
                    >
                      Reset filters
                    </Button>
                  )}
                </div>
                <AdvancedFilterFields {...advancedFieldsProps} />
              </PopoverContent>
            </Popover>
          )}

          {hasAnyFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
              onClick={handleClearAll}
            >
              <X className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          {chips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="shrink-0 gap-1 pr-1"
            >
              {chip.label}
              <button
                type="button"
                className="rounded-sm p-0.5 hover:bg-muted"
                onClick={chip.onRemove}
                aria-label={`Remove ${chip.label} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {isMobile && (
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side="bottom" className="max-h-[85vh] rounded-t-xl px-4 pb-6">
            <SheetHeader className="text-left">
              <SheetTitle>Filter expenses</SheetTitle>
              <SheetDescription>
                Narrow by customer, work order, or purpose.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto pb-2">
              <AdvancedFilterFields {...advancedFieldsProps} />
            </div>
            <div className="mt-4 flex gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onChange({
                    customerId: undefined,
                    workOrderId: undefined,
                    purpose: undefined,
                  })
                }}
              >
                Reset filters
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => setFiltersOpen(false)}
              >
                Apply
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

/** Build combined search string for expense list API */
export function expenseFiltersToSearch(
  filters: ExpenseFilterValues,
  customers: { id: number; name: string }[] = [],
  workOrders: { id: number; no: string }[] = []
): string | undefined {
  const parts: string[] = []

  if (filters.search) parts.push(filters.search)

  if (filters.customerId) {
    const customer = customers.find(
      (c) => String(c.id) === String(filters.customerId)
    )
    if (customer?.name) parts.push(customer.name)
  }

  if (filters.workOrderId) {
    const workOrder = workOrders.find(
      (wo) => String(wo.id) === String(filters.workOrderId)
    )
    if (workOrder?.no) parts.push(workOrder.no)
  }

  if (filters.purpose) parts.push(filters.purpose)

  return parts.length > 0 ? parts.join(' ') : undefined
}
